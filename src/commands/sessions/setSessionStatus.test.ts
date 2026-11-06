import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";
import { readHookClaudeSessionId } from "./readHookClaudeSessionId";
import { setSessionStatus } from "./setSessionStatus";

vi.mock("./daemon/sendToDaemonAwaitAck", () => ({
	sendToDaemonAwaitAck: vi.fn(),
}));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

vi.mock("./readHookClaudeSessionId", () => ({
	readHookClaudeSessionId: vi.fn(async () => undefined),
}));

const ackMock = sendToDaemonAwaitAck as unknown as ReturnType<typeof vi.fn>;
const logMock = appendDaemonLog as unknown as ReturnType<typeof vi.fn>;
const hookIdMock = readHookClaudeSessionId as unknown as ReturnType<
	typeof vi.fn
>;

describe("setSessionStatus", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		hookIdMock.mockResolvedValue(undefined);
		process.env.ASSIST_SESSION_ID = "s1";
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
		delete process.env.ASSIST_SESSION_ID;
	});

	it("awaits the daemon's ack even for a best-effort hint", async () => {
		ackMock.mockResolvedValue(undefined);

		await setSessionStatus("running");

		expect(ackMock).toHaveBeenCalledOnce();
		expect(ackMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "running",
			ack: true,
		});
	});

	it("reports the conversation id the hook fired for so a /clear rebinds", async () => {
		ackMock.mockResolvedValue(undefined);
		hookIdMock.mockResolvedValue("post-clear-id");

		await setSessionStatus("running", { source: "prompt" });

		expect(ackMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "running",
			claudeSessionId: "post-clear-id",
			source: "prompt",
			ack: true,
		});
	});

	it("skips the hook payload read for a caller that already consumed stdin", async () => {
		ackMock.mockResolvedValue(undefined);

		await setSessionStatus("waiting", {
			source: "stop",
			ack: true,
			readsClaudeHookInput: false,
		});

		expect(hookIdMock).not.toHaveBeenCalled();
		expect(ackMock).toHaveBeenCalledWith({
			type: "set-status",
			sessionId: "s1",
			status: "waiting",
			source: "stop",
			ack: true,
		});
	});

	describe("when ASSIST_SESSION_ID is absent", () => {
		it("does not send to the daemon", async () => {
			delete process.env.ASSIST_SESSION_ID;

			await setSessionStatus("running");

			expect(ackMock).not.toHaveBeenCalled();
		});
	});

	it("does not retry a best-effort hint but logs that it never arrived", async () => {
		ackMock.mockRejectedValue(new Error("timed out awaiting daemon ack"));

		await setSessionStatus("running", { source: "posttool" });

		expect(ackMock).toHaveBeenCalledOnce();
		expect(logMock).toHaveBeenCalledWith(
			"set-status delivery failed after 1 attempt: id=s1 status=running source=posttool: timed out awaiting daemon ack",
		);
	});

	it("uses the same ack'd payload for the blocking set", async () => {
		ackMock.mockResolvedValue(undefined);

		await setSessionStatus("waiting", { source: "permission", ack: true });

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
			expect.stringContaining("delivery failed after 3 attempts"),
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
