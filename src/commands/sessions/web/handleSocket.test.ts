import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import type { WebSocket } from "ws";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";
import { handleSocket } from "./handleSocket";

vi.mock("../daemon/connectToDaemon", () => ({ connectToDaemon: vi.fn() }));
vi.mock("../daemon/ensureDaemonRunning", () => ({
	ensureDaemonRunning: vi.fn(() => Promise.resolve()),
}));

const connectMock = connectToDaemon as unknown as ReturnType<typeof vi.fn>;
const ensureMock = ensureDaemonRunning as unknown as ReturnType<typeof vi.fn>;

function createConn() {
	const conn = new PassThrough();
	const write = vi.fn();
	const destroy = vi.fn();
	Object.assign(conn, { write, destroy });
	return { conn, write, destroy };
}

function createWs() {
	const listeners = new Map<string, (msg?: unknown) => void>();
	const ws = {
		OPEN: 1,
		readyState: 1,
		send: vi.fn(),
		close: vi.fn(),
		on: (event: string, cb: (msg?: unknown) => void) => {
			listeners.set(event, cb);
		},
	};
	return { ws: ws as unknown as WebSocket, listeners, send: ws.send };
}

function flush(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

const ctx = { serverCwd: "/server/cwd", repoCwd: "/repo" };

describe("handleSocket", () => {
	describe("relaying browser messages to the daemon", () => {
		it("injects the server cwd into create messages without one", async () => {
			const { conn, write } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, listeners } = createWs();

			handleSocket(ws, ctx);
			listeners.get("message")?.(JSON.stringify({ type: "create" }));
			await flush();

			expect(write).toHaveBeenCalledWith(
				`${JSON.stringify({ type: "create", cwd: "/server/cwd" })}\n`,
			);
		});

		it("keeps an explicit cwd", async () => {
			const { conn, write } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, listeners } = createWs();

			handleSocket(ws, ctx);
			listeners.get("message")?.(
				JSON.stringify({ type: "create", cwd: "/other" }),
			);
			await flush();

			expect(write).toHaveBeenCalledWith(
				`${JSON.stringify({ type: "create", cwd: "/other" })}\n`,
			);
		});
	});

	describe("relaying daemon messages to the browser", () => {
		it("injects the repo cwd into sessions messages", async () => {
			const { conn } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, send } = createWs();

			handleSocket(ws, ctx);
			await flush();
			conn.push(`${JSON.stringify({ type: "sessions", sessions: [] })}\n`);
			await flush();

			expect(send).toHaveBeenCalledWith(
				JSON.stringify({ type: "sessions", sessions: [], cwd: "/repo" }),
			);
		});

		it("relays output messages verbatim", async () => {
			const { conn } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, send } = createWs();
			const line = JSON.stringify({
				type: "output",
				sessionId: "1",
				data: "x",
			});

			handleSocket(ws, ctx);
			await flush();
			conn.push(`${line}\n`);
			await flush();

			expect(send).toHaveBeenCalledWith(line);
		});

		it("drops a large line cut off when the daemon connection closes", async () => {
			const log = vi.spyOn(console, "log").mockImplementation(() => {});
			const { conn } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, send } = createWs();
			const complete = JSON.stringify({ type: "output", data: "x" });
			const history = JSON.stringify({
				type: "history",
				sessions: Array.from({ length: 5000 }, (_, i) => ({
					id: `session-${i}`,
					title: "a".repeat(80),
				})),
			});

			handleSocket(ws, ctx);
			await flush();
			conn.push(`${complete}\n`);
			const partial = history.slice(0, 438_436);
			for (let i = 0; i < partial.length; i += 65_536)
				conn.push(partial.slice(i, i + 65_536));
			await flush();
			conn.push(null);
			await flush();
			conn.emit("close");
			await flush();

			expect(send.mock.calls).toEqual([[complete]]);
			expect(ws.close).toHaveBeenCalled();
			expect(log).toHaveBeenCalledOnce();
			log.mockRestore();
		});

		it("relays a line split across chunks once it completes", async () => {
			const { conn } = createConn();
			connectMock.mockResolvedValue(conn);
			const { ws, send } = createWs();
			const line = JSON.stringify({ type: "output", data: "é".repeat(10) });
			const bytes = Buffer.from(`${line}\n`);

			handleSocket(ws, ctx);
			await flush();
			conn.push(bytes.subarray(0, 23));
			conn.push(bytes.subarray(23));
			await flush();

			expect(send.mock.calls).toEqual([[line]]);
		});
	});

	it("destroys the daemon connection when the browser disconnects", async () => {
		const { conn, destroy } = createConn();
		connectMock.mockResolvedValue(conn);
		const { ws, listeners } = createWs();

		handleSocket(ws, ctx);
		await flush();
		listeners.get("close")?.();
		await flush();

		expect(destroy).toHaveBeenCalledOnce();
	});

	it("closes the browser socket when the daemon connection closes", async () => {
		const { conn } = createConn();
		connectMock.mockResolvedValue(conn);
		const { ws } = createWs();

		handleSocket(ws, ctx);
		await flush();
		conn.emit("close");

		expect(ws.close).toHaveBeenCalled();
	});

	it("reports an error and closes when the daemon is unavailable", async () => {
		ensureMock.mockRejectedValueOnce(new Error("daemon did not start"));
		const { ws, send } = createWs();

		handleSocket(ws, ctx);
		await flush();

		expect(send).toHaveBeenCalledWith(
			JSON.stringify({
				type: "error",
				message: "sessions daemon unavailable: daemon did not start",
			}),
		);
		expect(ws.close).toHaveBeenCalled();
	});
});
