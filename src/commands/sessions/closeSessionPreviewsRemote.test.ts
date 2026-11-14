import { afterEach, describe, expect, it, vi } from "vitest";
import { closeSessionPreviewsRemote } from "./closeSessionPreviewsRemote";
import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";

vi.mock("./daemon/sendToDaemonAwaitAck", () => ({
	sendToDaemonAwaitAck: vi.fn(),
}));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const ackMock = sendToDaemonAwaitAck as unknown as ReturnType<typeof vi.fn>;
const logMock = appendDaemonLog as unknown as ReturnType<typeof vi.fn>;

describe("closeSessionPreviewsRemote", () => {
	afterEach(() => vi.clearAllMocks());

	it("asks the daemon to close the session's previews", async () => {
		ackMock.mockResolvedValue(undefined);

		await closeSessionPreviewsRemote("s1", "phase done");

		expect(ackMock).toHaveBeenCalledWith({
			type: "close-previews",
			sessionId: "s1",
			reason: "phase done",
		});
	});

	it("does nothing without a target session", async () => {
		await closeSessionPreviewsRemote(undefined, "phase done");

		expect(ackMock).not.toHaveBeenCalled();
	});

	it("swallows an unreachable daemon and logs it", async () => {
		ackMock.mockRejectedValue(new Error("connect ENOENT"));

		await expect(
			closeSessionPreviewsRemote("s1", "phase done"),
		).resolves.toBeUndefined();
		expect(logMock).toHaveBeenCalledWith(
			"close-previews send failed: id=s1 (phase done): connect ENOENT",
		);
	});
});
