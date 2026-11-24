import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import { fetchAutopilotRunContract } from "./fetchAutopilotRunContract";

vi.unmock("./fetchAutopilotRunContract");
vi.mock("../sessions/daemon/requestDaemonReply", () => ({
	requestDaemonReply: vi.fn(),
}));

const reply = vi.mocked(requestDaemonReply);

describe("fetchAutopilotRunContract", () => {
	beforeEach(() => {
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "15");
		reply.mockReset();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("gives an autopilot run session the contract with the next tick time", async () => {
		reply.mockResolvedValue({
			autopilot: true,
			nextTickAt: "2026-11-24T19:55:56.000Z",
		});
		const contract = await fetchAutopilotRunContract(1921);
		expect(reply).toHaveBeenCalledWith(
			{ type: "autopilot-session", sessionId: "15" },
			"autopilot-session",
		);
		expect(contract).toContain(
			"The next tick runs at 2026-11-24T19:55:56.000Z.",
		);
		expect(contract).toContain(
			"- A check that can't be made before 2026-11-24T19:55:56.000Z belongs to that tick",
		);
		expect(contract).toContain("assist backlog comment a1921");
		expect(contract).toContain(
			"Handing a check to the tick counts as the user's instruction to complete",
		);
	});

	it("leaves a session outside autopilot unchanged", async () => {
		reply.mockResolvedValue({ autopilot: false });
		expect(await fetchAutopilotRunContract(1921)).toBeUndefined();
	});

	it("does not ask the daemon outside an assist session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");
		expect(await fetchAutopilotRunContract(1921)).toBeUndefined();
		expect(reply).not.toHaveBeenCalled();
	});
});
