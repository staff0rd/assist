import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "./daemon/connectToDaemon";
import { setSessionStatus } from "./setSessionStatus";

vi.mock("./daemon/connectToDaemon", () => ({
	connectToDaemon: vi.fn(),
}));

const connectMock = connectToDaemon as unknown as ReturnType<typeof vi.fn>;

describe("setSessionStatus", () => {
	beforeEach(() => {
		process.env.ASSIST_SESSION_ID = "s1";
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete process.env.ASSIST_SESSION_ID;
	});

	it("writes a newline-delimited set-status message to the daemon", async () => {
		const write = vi.fn((_data: string, cb: () => void) => cb());
		const socket = { write, on: vi.fn(), end: vi.fn(), destroy: vi.fn() };
		connectMock.mockResolvedValue(socket);

		await setSessionStatus("running");

		expect(write).toHaveBeenCalledWith(
			`${JSON.stringify({ type: "set-status", sessionId: "s1", status: "running" })}\n`,
			expect.any(Function),
		);
		expect(socket.end).toHaveBeenCalledOnce();
	});

	it("swallows errors when the daemon is not running", async () => {
		connectMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await expect(setSessionStatus("waiting")).resolves.toBeUndefined();
	});

	describe("when ASSIST_SESSION_ID is absent", () => {
		it("exits without connecting to the daemon", async () => {
			delete process.env.ASSIST_SESSION_ID;

			await setSessionStatus("running");

			expect(connectMock).not.toHaveBeenCalled();
		});
	});
});
