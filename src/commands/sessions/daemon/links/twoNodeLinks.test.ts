import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { dispatchMessage } from "../dispatchMessage";
import { messageHandlers } from "../messageHandlers";
import { SessionManager } from "../SessionManager";
import type { InProcessPeer } from "./inProcessClient";
import { inProcessTransport } from "./inProcessTransport";
import type { LinkSpec } from "./LinkStatus";
import type { LinkTunnel } from "./LinkTunnel";

const helloName = vi.hoisted(() => ({ current: "pc-windows" }));

vi.mock("../../shared/resolveNodeName", () => ({
	resolveNodeName: () => helloName.current,
}));
vi.mock("../loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
	persistLiveSessions: vi.fn(),
}));
vi.mock("../loadActiveSelection", () => ({
	loadActiveSelection: vi.fn(() => ({})),
	saveActiveSelection: vi.fn(),
}));
vi.mock("../daemonLog", () => ({
	daemonLog: vi.fn(),
	relayDaemonLog: vi.fn(),
	recentDaemonLogLines: () => [],
}));

type Msg = Record<string, unknown>;

function viewer() {
	const received: Msg[] = [];
	const client: SessionClient = { send: (d) => received.push(JSON.parse(d)) };
	const lastSessions = () =>
		(received.filter((m) => m.type === "sessions").at(-1)?.sessions ?? []) as {
			id: string;
			node?: string;
		}[];
	return { client, received, lastSessions };
}

function fakeSession(id: string): Session {
	return {
		id,
		name: `s${id}`,
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: { write: vi.fn(), kill: vi.fn(), resize: vi.fn() },
		scrollback: "",
	} as unknown as Session;
}

function addSession(manager: SessionManager, id: string): void {
	manager.update((sessions) => {
		sessions.set(id, fakeSession(id));
		return true;
	});
}

const peers = new Map<string, InProcessPeer>();
const bridge = inProcessTransport(peers, (name) => {
	helloName.current = name;
});

const tunnelReady = vi.fn();

function sshLink(name: string, alias: string, port: number, localPort: number) {
	return {
		name,
		url: `http://127.0.0.1:${localPort}`,
		ssh: { alias, port, localPort },
	};
}

function fakeTunnel(spec: LinkSpec): LinkTunnel | undefined {
	if (!spec.ssh) return undefined;
	return {
		ready: async () => {
			tunnelReady(spec.url);
			const peer = peers.get(`http://${spec.name}`);
			if (peer) peers.set(spec.url, peer);
		},
		dispose: () => peers.delete(spec.url),
	};
}

function node(name: string, links: LinkSpec[] = []) {
	const manager = new SessionManager();
	manager.links.configure({
		specs: () => links,
		localNode: () => name,
		transport: bridge.transport,
		tunnel: fakeTunnel,
		heal: vi.fn(async () => {}),
		reconnectMs: 5,
		createTimeoutMs: 200,
	});
	peers.set(`http://${name}`, { name, manager });
	return manager;
}

const WINDOWS = { name: "pc-windows", url: "http://pc-windows" };
const WSL = { name: "pc-wsl", url: "http://pc-wsl" };

afterEach(() => {
	for (const peer of peers.values()) peer.manager.links.dispose();
	peers.clear();
});

describe("two linked nodes", () => {
	it("merges the peer's sessions namespaced once with a node tag", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		const windows = node("pc-windows");
		addSession(wsl, "1");
		addSession(windows, "3");
		const view = viewer();
		wsl.addClient(view.client);

		wsl.links.reload();

		await vi.waitFor(() =>
			expect(view.lastSessions()).toEqual([
				expect.objectContaining({ id: "1" }),
				expect.objectContaining({ id: "pc-windows:3", node: "pc-windows" }),
			]),
		);
	});

	it("routes input for a namespaced id to the owning node's native id", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		const windows = node("pc-windows");
		addSession(windows, "3");
		const write = vi.spyOn(windows, "writeToSession");
		const view = viewer();
		wsl.addClient(view.client);
		wsl.links.reload();
		await vi.waitFor(() => expect(view.lastSessions()).toHaveLength(1));

		dispatchMessage(view.client, wsl, {
			type: "input",
			sessionId: "pc-windows:3",
			data: "hi",
		});

		expect(write).toHaveBeenCalledWith("3", "hi");
	});

	it("logs a forwarded launch's traceId on both nodes", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		node("pc-windows");
		const route = messageHandlers.create;
		const create = vi
			.spyOn(messageHandlers, "create")
			.mockImplementation((client, manager, data) => {
				if (data.node) route(client, manager, data);
			});
		const view = viewer();
		wsl.addClient(view.client);
		wsl.links.reload();
		await vi.waitFor(() =>
			expect(wsl.links.nodes().links[0].state).toBe("connected"),
		);

		dispatchMessage(view.client, wsl, {
			type: "create",
			node: "pc-windows",
			prompt: "x",
		});

		const forwarded = create.mock.lastCall?.[2] as Msg;
		expect(forwarded.traceId).toEqual(expect.any(String));
		const logged = vi.mocked(daemonLog).mock.calls.map((c) => c[0]);
		expect(logged).toEqual(
			expect.arrayContaining([
				expect.stringMatching(
					new RegExp(
						`^link pc-windows ws: routing create .*trace=${forwarded.traceId}$`,
					),
				),
				expect.stringMatching(
					new RegExp(`^linked create received .*trace=${forwarded.traceId}$`),
				),
			]),
		);
		create.mockRestore();
	});

	it("never re-exports linked sessions under symmetric linking", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		const windows = node("pc-windows", [WSL]);
		addSession(wsl, "1");
		addSession(windows, "3");
		const wslView = viewer();
		const windowsView = viewer();
		wsl.addClient(wslView.client);
		windows.addClient(windowsView.client);

		wsl.links.reload();
		windows.links.reload();

		await vi.waitFor(() => {
			expect(wslView.lastSessions().map((s) => s.id)).toEqual([
				"1",
				"pc-windows:3",
			]);
			expect(windowsView.lastSessions().map((s) => s.id)).toEqual([
				"3",
				"pc-wsl:1",
			]);
		});
	});

	it("drops the peer's cards on disconnect and restores them on reconnect", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		const windows = node("pc-windows");
		addSession(windows, "3");
		const view = viewer();
		wsl.addClient(view.client);
		wsl.links.reload();
		await vi.waitFor(() => expect(view.lastSessions()).toHaveLength(1));

		bridge.dropAll("code 1006");

		expect(view.lastSessions()).toEqual([]);
		await vi.waitFor(() =>
			expect(view.lastSessions()).toEqual([
				expect.objectContaining({ id: "pc-windows:3" }),
			]),
		);
	});

	it("heals an older peer once, then reconnects in step", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		const windows = node("pc-windows");
		const peer = peers.get(WINDOWS.url) as InProcessPeer;
		peer.reportVersion = "0.0.1";
		const heal = vi.fn(async () => {
			peer.reportVersion = undefined;
		});
		wsl.links.configure({
			specs: () => [WINDOWS],
			localNode: () => "pc-wsl",
			transport: bridge.transport,
			heal,
			reconnectMs: 5,
		});
		addSession(windows, "3");
		const view = viewer();
		wsl.addClient(view.client);

		wsl.links.reload();

		await vi.waitFor(() =>
			expect(view.lastSessions()).toEqual([
				expect.objectContaining({ id: "pc-windows:3" }),
			]),
		);
		expect(heal).toHaveBeenCalledOnce();
		expect(heal).toHaveBeenCalledWith(WINDOWS.url);
		expect(view.received).toContainEqual(
			expect.objectContaining({ type: "notice" }),
		);
	});

	it("latches and refuses launches when the mismatch persists after heal", async () => {
		const wsl = node("pc-wsl", [WINDOWS]);
		node("pc-windows");
		(peers.get(WINDOWS.url) as InProcessPeer).reportVersion = "0.0.1";
		const view = viewer();
		wsl.addClient(view.client);

		wsl.links.reload();

		await vi.waitFor(() =>
			expect(wsl.links.nodes().links[0].state).toBe("version-blocked"),
		);
		dispatchMessage(view.client, wsl, {
			type: "create",
			node: "pc-windows",
			prompt: "x",
		});
		expect(view.received.at(-1)).toEqual({
			type: "error",
			message: expect.stringContaining("update pc-windows manually"),
		});
	});
});

describe("a Mac linked to the PC over ssh with a reverse link", () => {
	it("merges both PC nodes through their tunnels and loops nothing back", async () => {
		const mac = node("mac", [
			sshLink("pc-wsl", "pc", 3100, 43100),
			sshLink("pc-windows", "pc", 3101, 43101),
		]);
		const wsl = node("pc-wsl", [WINDOWS, sshLink("mac", "mac", 3100, 43200)]);
		const windows = node("pc-windows");
		addSession(mac, "1");
		addSession(wsl, "2");
		addSession(windows, "3");
		const macView = viewer();
		const wslView = viewer();
		mac.addClient(macView.client);
		wsl.addClient(wslView.client);

		mac.links.reload();
		wsl.links.reload();

		const ids = (view: ReturnType<typeof viewer>) =>
			view
				.lastSessions()
				.map((s) => s.id)
				.sort();
		await vi.waitFor(() => {
			expect(ids(macView)).toEqual(["1", "pc-windows:3", "pc-wsl:2"]);
			expect(ids(wslView)).toEqual(["2", "mac:1", "pc-windows:3"]);
		});
		expect(tunnelReady.mock.calls.map((c) => c[0]).sort()).toEqual([
			"http://127.0.0.1:43100",
			"http://127.0.0.1:43101",
			"http://127.0.0.1:43200",
		]);
		const settled = macView.received.length + wslView.received.length;
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(macView.received.length + wslView.received.length).toBe(settled);
	});
});
