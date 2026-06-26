import type { AddressInfo } from "node:net";
import * as net from "node:net";
import { createInterface } from "node:readline";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import type { SessionClient } from "./broadcast";
import { PROTOCOL_VERSION } from "./buildHello";
import { WindowsProxy } from "./WindowsProxy";

// route() only proxies under WSL; tests run on plain Linux/macOS CI
vi.mock("../../../lib/detectPlatform", () => ({ detectPlatform: () => "wsl" }));

// A fake native Windows daemon: one TCP connection whose received lines and
// send() helper let the test drive the proxy from the far end.
type FakeDaemon = {
	port: number;
	received: string[];
	send: (msg: object) => void;
	dropPeer: () => void;
	close: () => Promise<void>;
};

async function startFakeDaemon(): Promise<FakeDaemon> {
	const received: string[] = [];
	let peer: net.Socket | null = null;
	const server = net.createServer((socket) => {
		peer = socket;
		const lines = createInterface({ input: socket });
		lines.on("line", (line) => received.push(line));
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const { port } = server.address() as AddressInfo;

	return {
		port,
		received,
		send: (msg) => peer?.write(`${JSON.stringify(msg)}\n`),
		/* why: drop just the client connection while the server keeps listening,
		 * so the proxy reconnects to the same daemon on its next create */
		dropPeer: () => peer?.destroy(),
		close: () =>
			new Promise((resolve) => {
				peer?.destroy();
				server.close(() => resolve());
			}),
	};
}

function waitFor(predicate: () => boolean, timeoutMs = 1000): Promise<void> {
	return new Promise((resolve, reject) => {
		const deadline = Date.now() + timeoutMs;
		const tick = () => {
			if (predicate()) return resolve();
			if (Date.now() > deadline) return reject(new Error("waitFor timed out"));
			setTimeout(tick, 5);
		};
		tick();
	});
}

function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 10));
}

describe("WindowsProxy", () => {
	let daemon: FakeDaemon;
	let proxy: WindowsProxy;
	let broadcasts: object[];
	let heal: Mock<() => Promise<void>>;

	function connectToDaemon(): Promise<net.Socket> {
		return new Promise((resolve, reject) => {
			const s = net.connect(daemon.port, "127.0.0.1");
			s.once("connect", () => resolve(s));
			s.once("error", reject);
		});
	}

	beforeEach(async () => {
		daemon = await startFakeDaemon();
		broadcasts = [];
		// why: a mismatch triggers heal, which would otherwise spawn pwsh.exe
		heal = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
		const clients = new Set<SessionClient>([
			{ send: (data) => broadcasts.push(JSON.parse(data)) },
		]);
		proxy = new WindowsProxy(clients, () => {}, connectToDaemon, heal);
	});

	afterEach(async () => {
		proxy.dispose();
		await daemon.close();
		// let the disposed socket's async 'close' drain before the next test
		await settle();
	});

	function client(): SessionClient & { sent: object[] } {
		const sent: object[] = [];
		return { sent, send: (data) => sent.push(JSON.parse(data)) };
	}

	async function createWindowsSession(): Promise<void> {
		proxy.route(client(), { type: "create", cwd: "C:\\repo" });
		await waitFor(() => daemon.received.length >= 1);
	}

	it("forwards create and relays a namespaced created ack to the requester", async () => {
		const c = client();
		expect(proxy.route(c, { type: "create", cwd: "C:\\repo" })).toBe(true);

		await waitFor(() => daemon.received.length >= 3);
		// why: hello then a log subscription precede the create over the bridge
		expect(JSON.parse(daemon.received[0]).type).toBe("hello");
		expect(JSON.parse(daemon.received[1]).type).toBe("subscribe-logs");
		expect(JSON.parse(daemon.received[2])).toMatchObject({
			type: "create",
			cwd: "C:\\repo",
		});

		daemon.send({ type: "created", sessionId: "3" });
		await waitFor(() => c.sent.length >= 1);
		expect(c.sent[0]).toEqual({ type: "created", sessionId: "w-3" });
	});

	it("namespaces session ids in the merged list", async () => {
		await createWindowsSession();
		daemon.send({
			type: "sessions",
			sessions: [{ id: "3", name: "app", cwd: "C:\\repo" }],
		});
		await waitFor(() => proxy.sessions().length === 1);
		expect(proxy.sessions()).toEqual([
			{ id: "w-3", name: "app", cwd: "C:\\repo" },
		]);
	});

	it("relays output with a namespaced id and replays scrollback to new clients", async () => {
		await createWindowsSession();
		daemon.send({ type: "output", sessionId: "3", data: "hello" });
		await waitFor(() => broadcasts.length > 0);
		expect(broadcasts[0]).toEqual({
			type: "output",
			sessionId: "w-3",
			data: "hello",
		});

		const late = client();
		proxy.replayScrollback(late);
		expect(late.sent).toEqual([
			{ type: "output", sessionId: "w-3", data: "hello" },
		]);
	});

	it("strips the namespace when forwarding I/O back to the daemon", async () => {
		await createWindowsSession();
		expect(
			proxy.route(client(), { type: "input", sessionId: "w-3", data: "ls\n" }),
		).toBe(true);
		await waitFor(() => daemon.received.some((l) => l.includes('"input"')));
		const input = daemon.received
			.map((l) => JSON.parse(l))
			.find((m) => m.type === "input");
		expect(input).toEqual({ type: "input", sessionId: "3", data: "ls\n" });
	});

	it("strips the namespace when forwarding a resume to the daemon", async () => {
		await createWindowsSession();
		/* why: the UI resumes a windows session by its namespaced id (w-3); if the
		 * prefix isn't stripped the daemon resumes a non-existent transcript and
		 * re-reports an id we namespace again into w-w-3, w-w-w-3, ... */
		proxy.route(client(), {
			type: "resume",
			sessionId: "w-3",
			cwd: "C:\\repo",
			name: "app",
		});
		await waitFor(() => daemon.received.some((l) => l.includes('"resume"')));
		const resume = daemon.received
			.map((l) => JSON.parse(l))
			.find((m) => m.type === "resume");
		expect(resume).toMatchObject({ type: "resume", sessionId: "3" });
	});

	it("drops sessions when the connection closes", async () => {
		await createWindowsSession();
		daemon.send({
			type: "sessions",
			sessions: [{ id: "3", name: "app", cwd: "C:\\repo" }],
		});
		await waitFor(() => proxy.sessions().length === 1);

		await daemon.close();
		await waitFor(() => proxy.sessions().length === 0);
	});

	it("surfaces an error to the client when connect fails", async () => {
		const failing = new WindowsProxy(
			new Set(),
			() => {},
			() => Promise.reject(new Error("no windows daemon")),
		);
		const c = client();
		failing.route(c, { type: "create", cwd: "C:\\repo" });
		await waitFor(() => c.sent.length >= 1);
		expect(c.sent[0]).toMatchObject({ type: "error" });
	});

	it("surfaces an error to the client when the windows daemon never acks a create", async () => {
		/* why: the daemon connects but never sends `created`; a tiny timeout fires
		 * the error so the web UI shows something instead of hanging silently */
		const slow = new WindowsProxy(
			new Set(),
			() => {},
			connectToDaemon,
			heal,
			30,
		);
		const c = client();
		slow.route(c, { type: "create", cwd: "C:\\repo" });
		await waitFor(() =>
			c.sent.some((m) => (m as { type?: string }).type === "error"),
		);
		expect(c.sent.at(-1)).toMatchObject({ type: "error" });
		slow.dispose();
	});

	it("clears the timeout once the create is acked", async () => {
		/* why: a created ack must cancel the timeout so no late error reaches a
		 * client that already got its card */
		const slow = new WindowsProxy(
			new Set(),
			() => {},
			connectToDaemon,
			heal,
			30,
		);
		const c = client();
		slow.route(c, { type: "create", cwd: "C:\\repo" });
		await waitFor(() => daemon.received.some((l) => l.includes('"create"')));
		daemon.send({ type: "created", sessionId: "3" });
		await waitFor(() =>
			c.sent.some((m) => (m as { type?: string }).type === "created"),
		);
		// why: wait past the 30ms timeout to prove the ack cancelled it
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(
			c.sent.filter((m) => (m as { type?: string }).type === "error"),
		).toEqual([]);
		slow.dispose();
	});

	it("does not claim local sessions", () => {
		expect(
			proxy.route(client(), { type: "create", cwd: "/home/me/repo" }),
		).toBe(false);
		expect(
			proxy.route(client(), { type: "input", sessionId: "3", data: "x" }),
		).toBe(false);
	});

	it("logs a warning on protocol mismatch", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		await createWindowsSession();
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() =>
			log.mock.calls.some((c) => String(c[0]).includes("protocol mismatch")),
		);
		log.mockRestore();
	});

	it("does not heal when the protocol matches despite a differing app version", async () => {
		await createWindowsSession();
		await waitFor(() => daemon.received.some((l) => l.includes('"hello"')));

		daemon.send({
			type: "hello",
			version: "0.0.0-different",
			protocol: PROTOCOL_VERSION,
		});
		await settle();

		expect(heal).not.toHaveBeenCalled();
		expect(
			broadcasts.some((m) => (m as { type?: string }).type === "error"),
		).toBe(false);
	});

	it("auto-heals and reconnects on version mismatch", async () => {
		await createWindowsSession();
		await waitFor(() => daemon.received.some((l) => l.includes('"hello"')));
		const before = daemon.received.length;

		daemon.send({ type: "hello", version: "0.0.0-mismatch" });

		await waitFor(() => heal.mock.calls.length === 1);
		await waitFor(() =>
			daemon.received.slice(before).some((l) => l.includes('"hello"')),
		);
	});

	it("heals only once even if the mismatch repeats", async () => {
		await createWindowsSession();
		const before = daemon.received.length;
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() => heal.mock.calls.length === 1);
		// why: wait for reconnect so the repeat mismatch reaches the live peer
		await waitFor(() =>
			daemon.received.slice(before).some((l) => l.includes('"hello"')),
		);

		// why: simulate WSL being the older side — heal can't fix that, so a repeat mismatch must not trigger another heal
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await settle();
		expect(heal.mock.calls.length).toBe(1);
	});

	it("does not re-heal after a connection close re-establishes the link", async () => {
		await createWindowsSession();
		const before = daemon.received.length;
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() => heal.mock.calls.length === 1);
		await waitFor(() =>
			daemon.received.slice(before).some((l) => l.includes('"hello"')),
		);

		/* why: a dropped connection resets the proxy's session state; the
		 * healAttempted guard must NOT be re-armed by that reset, or a host stuck
		 * on an unfixable mismatch would loop heal → reconnect → heal forever */
		daemon.dropPeer();
		await waitFor(() => proxy.sessions().length === 0);

		const reconnected = daemon.received.length;
		proxy.route(client(), { type: "create", cwd: "C:\\repo" });
		await waitFor(() =>
			daemon.received.slice(reconnected).some((l) => l.includes('"hello"')),
		);
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await settle();
		expect(heal.mock.calls.length).toBe(1);
	});

	it("stops reconnecting and refuses creates once a mismatch persists after heal", async () => {
		await createWindowsSession();
		const before = daemon.received.length;
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() => heal.mock.calls.length === 1);
		await waitFor(() =>
			daemon.received.slice(before).some((l) => l.includes('"hello"')),
		);

		/* why: the mismatch is still here after the one heal — the real runaway is
		 * this reconnect→mismatch→remote-close cycle, not launch failures. The proxy
		 * must give up: surface one error and stop reopening the connection. */
		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() =>
			broadcasts.some(
				(m) =>
					(m as { type?: string }).type === "error" &&
					String((m as { message?: string }).message).includes(
						"incompatible version",
					),
			),
		);

		/* why: a further create is refused with an error and never reaches the
		 * daemon, and discovery no longer reopens the connection */
		const settled = daemon.received.length;
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const c = client();
		expect(proxy.route(c, { type: "create", cwd: "C:\\repo" })).toBe(true);
		await waitFor(() =>
			c.sent.some((m) => (m as { type?: string }).type === "error"),
		);
		// why: the refusal must be logged, not just toasted, so daemon.log records why nothing started
		expect(
			log.mock.calls.some((call) =>
				String(call[0]).includes("refusing create"),
			),
		).toBe(true);
		log.mockRestore();
		await proxy.discover();
		await settle();
		expect(daemon.received.length).toBe(settled);
		expect(heal.mock.calls.length).toBe(1);
	});

	it("is inert on the Windows host: never dials, never claims a create", async () => {
		const original = process.platform;
		Object.defineProperty(process, "platform", { value: "win32" });
		try {
			const connect = vi.fn(connectToDaemon);
			const onWindows = new WindowsProxy(new Set(), () => {}, connect, heal);
			const c = client();
			expect(onWindows.route(c, { type: "create", cwd: "C:\\repo" })).toBe(
				false,
			);
			await onWindows.discover();
			await settle();
			expect(connect).not.toHaveBeenCalled();
			expect(c.sent).toEqual([]);
			onWindows.dispose();
		} finally {
			Object.defineProperty(process, "platform", { value: original });
		}
	});

	it("tells a pending creator to reselect while it heals", async () => {
		const c = client();
		proxy.route(c, { type: "create", cwd: "C:\\repo" });
		await waitFor(() => daemon.received.length >= 1);

		daemon.send({ type: "hello", version: "0.0.0-mismatch" });
		await waitFor(() =>
			c.sent.some((m) => (m as { type: string }).type === "error"),
		);
		expect(c.sent[0]).toMatchObject({ type: "error" });
	});
});
