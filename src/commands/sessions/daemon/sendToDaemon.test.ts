import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "./connectToDaemon";
import { sendToDaemon } from "./sendToDaemon";

vi.mock("./connectToDaemon", () => ({
	connectToDaemon: vi.fn(),
}));

const connectMock = connectToDaemon as unknown as ReturnType<typeof vi.fn>;

function fakeSocket(write: (data: string, cb: () => void) => void) {
	const socket = Object.assign(new EventEmitter(), {
		write: vi.fn(write),
		end: vi.fn(),
		destroy: vi.fn(),
	});
	return socket;
}

describe("sendToDaemon", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("resolves only after the write has flushed, then ends the socket", async () => {
		let flush: (() => void) | undefined;
		const socket = fakeSocket((_data, cb) => {
			flush = cb;
		});
		connectMock.mockResolvedValue(socket);

		let resolved = false;
		const done = sendToDaemon({ type: "set-status" }).then(() => {
			resolved = true;
		});
		await Promise.resolve();

		expect(resolved).toBe(false);
		expect(socket.end).not.toHaveBeenCalled();

		flush?.();
		await done;

		expect(resolved).toBe(true);
		expect(socket.write).toHaveBeenCalledWith(
			`${JSON.stringify({ type: "set-status" })}\n`,
			expect.any(Function),
		);
		expect(socket.end).toHaveBeenCalledOnce();
	});

	it("rejects when the connection cannot be established", async () => {
		connectMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await expect(sendToDaemon({ type: "set-status" })).rejects.toThrow(
			"ECONNREFUSED",
		);
	});

	it("rejects when the socket errors before the write flushes", async () => {
		const socket = fakeSocket(() => {});
		connectMock.mockResolvedValue(socket);

		const done = sendToDaemon({ type: "set-status" });
		await new Promise((resolve) => setImmediate(resolve));
		socket.emit("error", new Error("EPIPE"));

		await expect(done).rejects.toThrow("EPIPE");
	});

	it("destroys the socket and rejects when the write times out", async () => {
		vi.useFakeTimers();
		const socket = fakeSocket(() => {});
		connectMock.mockResolvedValue(socket);

		const done = sendToDaemon({ type: "set-status" });
		const assertion = expect(done).rejects.toThrow("timed out");
		await vi.runAllTimersAsync();
		await assertion;

		expect(socket.destroy).toHaveBeenCalledOnce();
	});
});
