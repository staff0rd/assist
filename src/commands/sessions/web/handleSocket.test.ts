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
