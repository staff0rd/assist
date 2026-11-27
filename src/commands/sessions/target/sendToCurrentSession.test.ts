import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendDaemonLog } from "../daemon/appendDaemonLog";
import { sendToDaemon } from "../daemon/sendToDaemon";
import { sendToCurrentSession } from "./sendToCurrentSession";

vi.mock("../daemon/sendToDaemon", () => ({ sendToDaemon: vi.fn() }));
vi.mock("../daemon/appendDaemonLog", () => ({ appendDaemonLog: vi.fn() }));

const dismiss = (sessionId: string) => ({ type: "dismiss", sessionId });

describe("sendToCurrentSession", () => {
	beforeEach(() => {
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "42");
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("sends the message for the current session", async () => {
		vi.mocked(sendToDaemon).mockResolvedValue(undefined);

		await sendToCurrentSession("close", dismiss);

		expect(sendToDaemon).toHaveBeenCalledWith(dismiss("42"));
		expect(process.exitCode).toBeUndefined();
	});

	it("reports an undelivered message on stderr and exits non-zero", async () => {
		vi.mocked(sendToDaemon).mockRejectedValue(
			new Error("timed out awaiting daemon ack"),
		);

		await sendToCurrentSession("close", dismiss);

		expect(console.error).toHaveBeenCalledWith(
			"Failed to close session 42: timed out awaiting daemon ack",
		);
		expect(appendDaemonLog).toHaveBeenCalledWith(
			"close send failed: id=42: timed out awaiting daemon ack",
		);
		expect(process.exitCode).toBe(1);
	});
});
