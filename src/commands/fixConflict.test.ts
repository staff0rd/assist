import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCheckoutPr = vi.fn();
const mockSpawnClaude = vi.fn(() => ({ done: Promise.resolve(0) }));
const calls: string[] = [];

vi.mock("./review/checkoutPr", () => ({
	checkoutPr: (number: string) => {
		calls.push("checkout");
		return mockCheckoutPr(number);
	},
}));

vi.mock("../shared/spawnClaude", () => ({
	spawnClaude: (...args: unknown[]) => {
		calls.push("claude");
		return mockSpawnClaude(...(args as []));
	},
}));

vi.mock("../shared/emitActivity", () => ({ emitActivity: vi.fn() }));

import { fixConflict } from "./fixConflict";

beforeEach(() => {
	vi.clearAllMocks();
	calls.length = 0;
	delete process.env.ASSIST_RESUME_IDLE;
	delete process.env.ASSIST_RESUME_PROMPT;
});

describe("fixConflict", () => {
	describe("when a PR number is given", () => {
		it("should check the PR out before launching the session", async () => {
			await fixConflict("123");

			expect(mockCheckoutPr).toHaveBeenCalledWith("123");
			expect(calls).toEqual(["checkout", "claude"]);
		});
	});

	describe("when no PR number is given", () => {
		it("should run in the tree it was invoked in", async () => {
			await fixConflict();

			expect(mockCheckoutPr).not.toHaveBeenCalled();
			expect(mockSpawnClaude).toHaveBeenCalled();
		});
	});

	describe("without --rebase", () => {
		it("should ask for the merge strategy", async () => {
			await fixConflict("123");

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"/fix-conflict",
				expect.anything(),
			);
		});
	});

	describe("with --rebase", () => {
		it("should pass the rebase strategy through to the prompt", async () => {
			await fixConflict("123", { rebase: true });

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"/fix-conflict --rebase",
				expect.anything(),
			);
		});
	});

	describe("when resuming an interrupted session", () => {
		it("should resume the recorded conversation instead of checking the PR out again", async () => {
			await fixConflict("123", { resumeSessionId: "conv-1" });

			expect(mockCheckoutPr).not.toHaveBeenCalled();
			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.stringContaining("Continue from where you left off"),
				expect.objectContaining({ resumeSessionId: "conv-1" }),
			);
		});

		it("should reattach without a nudge when the conversation was idle", async () => {
			process.env.ASSIST_RESUME_IDLE = "1";

			await fixConflict("123", { resumeSessionId: "conv-1" });

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"",
				expect.objectContaining({ resumeSessionId: "conv-1" }),
			);
		});
	});
});
