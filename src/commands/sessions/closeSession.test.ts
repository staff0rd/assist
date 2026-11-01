import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeSession } from "./closeSession";
import { sendToDaemon } from "./daemon/sendToDaemon";

vi.mock("./daemon/sendToDaemon", () => ({
	sendToDaemon: vi.fn(),
}));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const sendMock = sendToDaemon as unknown as ReturnType<typeof vi.fn>;

describe("closeSession", () => {
	beforeEach(() => {
		sendMock.mockResolvedValue(undefined);
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		delete process.env.ASSIST_SESSION;
		delete process.env.ASSIST_SESSION_ID;
	});

	it("dismisses the current session and its child server runs with the daemon", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await closeSession();

		expect(sendMock).toHaveBeenCalledOnce();
		expect(sendMock).toHaveBeenCalledWith({
			type: "dismiss",
			sessionId: "s1",
			closeServerRuns: true,
		});
	});

	it("reports there is nothing to close outside a daemon-managed session", async () => {
		await closeSession();

		expect(sendMock).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith(
			"No daemon-managed session to close.",
		);
	});

	it("does not send when the session id is missing", async () => {
		process.env.ASSIST_SESSION = "1";

		await closeSession();

		expect(sendMock).not.toHaveBeenCalled();
	});

	it("swallows a failed send so the command still exits cleanly", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		sendMock.mockRejectedValue(new Error("no daemon"));

		await expect(closeSession()).resolves.toBeUndefined();
	});
});
