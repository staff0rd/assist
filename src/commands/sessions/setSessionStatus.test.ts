import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { setSessionStatus } from "./setSessionStatus";

vi.mock("./daemon/sendToDaemon", () => ({
	sendToDaemon: vi.fn(),
}));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const sendMock = sendToDaemon as unknown as ReturnType<typeof vi.fn>;
const logMock = appendDaemonLog as unknown as ReturnType<typeof vi.fn>;

describe("setSessionStatus", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		process.env.ASSIST_SESSION_ID = "s1";
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
		delete process.env.ASSIST_SESSION_ID;
	});

	it("sends a set-status message to the daemon", async () => {
		sendMock.mockResolvedValue(undefined);

		await setSessionStatus("running");

		expect(sendMock).toHaveBeenCalledOnce();
		expect(sendMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "running",
		});
		expect(logMock).not.toHaveBeenCalledWith(
			expect.stringContaining("delivery failed"),
		);
	});

	describe("when ASSIST_SESSION_ID is absent", () => {
		it("does not send to the daemon", async () => {
			delete process.env.ASSIST_SESSION_ID;

			await setSessionStatus("running");

			expect(sendMock).not.toHaveBeenCalled();
		});
	});

	it("retries then logs a failure when delivery never succeeds", async () => {
		sendMock.mockRejectedValue(new Error("ECONNREFUSED"));

		const done = setSessionStatus("waiting");
		await vi.runAllTimersAsync();
		await done;

		expect(sendMock).toHaveBeenCalledTimes(3);
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("set-status delivery failed after 3 attempts"),
		);
	});

	it("recovers on a retry without logging a failure", async () => {
		sendMock
			.mockRejectedValueOnce(new Error("ECONNREFUSED"))
			.mockResolvedValueOnce(undefined);

		const done = setSessionStatus("waiting");
		await vi.runAllTimersAsync();
		await done;

		expect(sendMock).toHaveBeenCalledTimes(2);
		expect(logMock).not.toHaveBeenCalledWith(
			expect.stringContaining("delivery failed"),
		);
	});
});
