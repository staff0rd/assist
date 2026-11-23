import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refuseMissingSummary } from "./refuseMissingSummary";

const mockReply = vi.fn();

vi.mock("../../sessions/daemon/requestDaemonReply", () => ({
	requestDaemonReply: (...args: unknown[]) => mockReply(...args),
}));

const item = {
	name: "Fresh agent",
	type: "story" as const,
	acceptanceCriteria: [],
	phases: [],
};

describe("refuseMissingSummary", () => {
	beforeEach(() => {
		mockReply.mockReset();
		process.exitCode = undefined;
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		process.exitCode = undefined;
	});

	it("refuses an autopilot session's proposal without a summary, with the reason", async () => {
		mockReply.mockResolvedValue({ autopilot: true });
		expect(await refuseMissingSummary(item, "7")).toBe(true);
		expect(mockReply).toHaveBeenCalledWith(
			{ type: "autopilot-session", sessionId: "7" },
			"autopilot-session",
		);
		expect(process.exitCode).toBe(1);
		expect(String(vi.mocked(console.error).mock.calls[0][0])).toContain(
			'one-line "summary"',
		);
	});

	it("accepts an autopilot session's proposal with a summary", async () => {
		mockReply.mockResolvedValue({ autopilot: true });
		expect(
			await refuseMissingSummary({ ...item, summary: "Predicts +3k/h" }, "7"),
		).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});

	it("accepts an interactive session's proposal without a summary", async () => {
		mockReply.mockResolvedValue({ autopilot: false });
		expect(await refuseMissingSummary(item, "7")).toBe(false);
		expect(process.exitCode).toBeUndefined();
	});
});
