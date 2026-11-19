import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { sendToSession } from "./target/sendToSession";
import { renameSession } from "./renameSession";

vi.mock("./daemon/sendToDaemon", () => ({
	sendToDaemon: vi.fn(),
}));

vi.mock("./target/sendToSession", () => ({ sendToSession: vi.fn() }));

vi.mock("./daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const sendMock = sendToDaemon as unknown as ReturnType<typeof vi.fn>;

describe("renameSession", () => {
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

	it("sends the new title for the current session to the daemon", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await renameSession("fix login redirect");

		expect(sendMock).toHaveBeenCalledOnce();
		expect(sendMock).toHaveBeenCalledWith({
			type: "rename",
			sessionId: "s1",
			title: "fix login redirect",
		});
	});

	it("reports there is nothing to rename outside a daemon-managed session", async () => {
		await renameSession("fix login redirect");

		expect(sendMock).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith(
			"No daemon-managed session to rename.",
		);
	});

	it("does not send when the session id is missing", async () => {
		process.env.ASSIST_SESSION = "1";

		await renameSession("fix login redirect");

		expect(sendMock).not.toHaveBeenCalled();
	});

	it("swallows a failed send so the command still exits cleanly", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		sendMock.mockRejectedValue(new Error("no daemon"));

		await expect(renameSession("fix login redirect")).resolves.toBeUndefined();
	});

	it("routes an explicit id to the targeted session instead of the current one", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await renameSession("fix login redirect", { id: "laptop:s9" });

		expect(sendMock).not.toHaveBeenCalled();
		const [id, build] = vi.mocked(sendToSession).mock.calls[0];
		expect(id).toBe("laptop:s9");
		expect(build(id)).toEqual({
			type: "rename",
			sessionId: "laptop:s9",
			title: "fix login redirect",
		});
	});
});
