import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";
import { setSessionStatus } from "./setSessionStatus";

vi.mock("./daemon/sendToDaemon", () => ({
	sendToDaemon: vi.fn(),
}));

vi.mock("./daemon/sendToDaemonAwaitAck", () => ({
	sendToDaemonAwaitAck: vi.fn(),
}));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const sendMock = sendToDaemon as unknown as ReturnType<typeof vi.fn>;
const ackMock = sendToDaemonAwaitAck as unknown as ReturnType<typeof vi.fn>;
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

	it("sends a bare best-effort set-status message to the daemon", async () => {
		sendMock.mockResolvedValue(undefined);

		await setSessionStatus("running");

		expect(sendMock).toHaveBeenCalledOnce();
		expect(sendMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "running",
		});
		expect(ackMock).not.toHaveBeenCalled();
	});

	it("includes the source but no ack flag for a best-effort hint", async () => {
		sendMock.mockResolvedValue(undefined);

		await setSessionStatus("running", { source: "pretool" });

		expect(sendMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "running",
			source: "pretool",
		});
	});

	describe("when ASSIST_SESSION_ID is absent", () => {
		it("does not send to the daemon", async () => {
			delete process.env.ASSIST_SESSION_ID;

			await setSessionStatus("running");

			expect(sendMock).not.toHaveBeenCalled();
			expect(ackMock).not.toHaveBeenCalled();
		});
	});

	it("does not retry a best-effort hint that fails to send", async () => {
		sendMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await setSessionStatus("running", { source: "posttool" });

		expect(sendMock).toHaveBeenCalledOnce();
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("best-effort send failed"),
		);
	});

	it("uses ack'd delivery for the blocking set and marks the payload", async () => {
		ackMock.mockResolvedValue(undefined);

		await setSessionStatus("waiting", { source: "permission", ack: true });

		expect(sendMock).not.toHaveBeenCalled();
		expect(ackMock).toHaveBeenCalledOnce();
		expect(ackMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "waiting",
			source: "permission",
			ack: true,
		});
	});

	it("retries then logs a failure when ack'd delivery never succeeds", async () => {
		ackMock.mockRejectedValue(new Error("no ack"));

		const done = setSessionStatus("waiting", { source: "stop", ack: true });
		await vi.runAllTimersAsync();
		await done;

		expect(ackMock).toHaveBeenCalledTimes(3);
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("ack'd delivery failed after 3 attempts"),
		);
	});

	it("recovers on a retry without logging a failure", async () => {
		ackMock
			.mockRejectedValueOnce(new Error("no ack"))
			.mockResolvedValueOnce(undefined);

		const done = setSessionStatus("waiting", {
			source: "notification",
			ack: true,
		});
		await vi.runAllTimersAsync();
		await done;

		expect(ackMock).toHaveBeenCalledTimes(2);
		expect(logMock).not.toHaveBeenCalledWith(
			expect.stringContaining("delivery failed"),
		);
	});
});
