import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { interruptSession } from "./interruptSession";
import { sendToSession } from "./target/sendToSession";

vi.mock("./daemon/sendToDaemon", () => ({ sendToDaemon: vi.fn() }));
vi.mock("./daemon/appendDaemonLog", () => ({ appendDaemonLog: vi.fn() }));
vi.mock("./target/sendToSession", () => ({ sendToSession: vi.fn() }));

describe("interruptSession", () => {
	beforeEach(() => {
		vi.mocked(sendToDaemon).mockResolvedValue(undefined);
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		delete process.env.ASSIST_SESSION;
		delete process.env.ASSIST_SESSION_ID;
	});

	it("interrupts the current session when no id is given", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await interruptSession();

		expect(sendToDaemon).toHaveBeenCalledWith({
			type: "interrupt",
			sessionId: "s1",
		});
		expect(sendToSession).not.toHaveBeenCalled();
	});

	it("routes an explicit id to the targeted session", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await interruptSession({ id: "laptop:s9" });

		expect(sendToDaemon).not.toHaveBeenCalled();
		const [id, build] = vi.mocked(sendToSession).mock.calls[0];
		expect(id).toBe("laptop:s9");
		expect(build(id)).toEqual({ type: "interrupt", sessionId: "laptop:s9" });
	});

	it("refuses a targeted session that is not a Claude SDK session", async () => {
		await interruptSession({ id: "s2" });

		const refuse = vi.mocked(sendToSession).mock.calls[0][2];
		expect(refuse?.({ id: "s2", sdk: true } as never)).toBeUndefined();
		expect(refuse?.({ id: "s2" } as never)).toContain(
			"Session s2 is not a Claude SDK session",
		);
	});

	it("reports there is nothing to interrupt outside a daemon-managed session", async () => {
		await interruptSession();

		expect(sendToDaemon).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith(
			"No daemon-managed session to interrupt.",
		);
	});
});
