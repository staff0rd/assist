import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

const mockExecFileSync = vi.mocked(execFileSync);
const mockReviewPr = vi.fn();
const mockMoveToPrCheckoutTree = vi.fn();
const mockSpawnClaude = vi.fn((_prompt: string, _options?: unknown) => ({
	done: Promise.resolve(0),
}));
const mockEmitActivity = vi.fn();

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../../shared/emitActivity", () => ({
	emitActivity: (...args: unknown[]) => mockEmitActivity(...args),
}));

vi.mock("../../shared/spawnClaude", () => ({
	spawnClaude: (prompt: string, options?: unknown) =>
		mockSpawnClaude(prompt, options),
}));

vi.mock("./moveToPrCheckoutTree", () => ({
	moveToPrCheckoutTree: () => mockMoveToPrCheckoutTree(),
}));

vi.mock("../../shared/findRepoRoot", () => ({
	findRepoRoot: () => "/repo",
}));

vi.mock("./reviewPr", () => ({
	reviewPr: (...args: unknown[]) => mockReviewPr(...args),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});

import { review } from "./review";

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset();
});

describe("review", () => {
	describe("when a PR number is given", () => {
		it("should check out the PR before reviewing", async () => {
			await review({ number: "123" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123"],
				{ stdio: "inherit" },
			);
			expect(mockReviewPr).toHaveBeenCalledWith("/repo", { number: "123" });
		});

		it("should route the checkout through the worktree allocator", async () => {
			await review({ number: "123" });

			expect(mockMoveToPrCheckoutTree).toHaveBeenCalled();
		});
	});

	describe("when the checkout fails", () => {
		it("should abort without reviewing", async () => {
			mockExecFileSync.mockImplementation(() => {
				throw new Error("gh failed");
			});

			await expect(review({ number: "123" })).rejects.toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockReviewPr).not.toHaveBeenCalled();
		});
	});

	describe("when no PR number is given", () => {
		it("should review the current branch's PR without checking out", async () => {
			await review();

			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(mockReviewPr).toHaveBeenCalledWith("/repo", {});
		});

		it("should stay in the tree it was invoked in", async () => {
			await review();

			expect(mockMoveToPrCheckoutTree).not.toHaveBeenCalled();
		});
	});

	describe("when --apply is combined with --refine", () => {
		it("should reject", async () => {
			await expect(review({ apply: true, refine: true })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockReviewPr).not.toHaveBeenCalled();
		});
	});

	describe("when --backlog is combined with --refine", () => {
		it("should reject", async () => {
			await expect(review({ backlog: true, refine: true })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockReviewPr).not.toHaveBeenCalled();
		});
	});

	describe("when --backlog is combined with --apply", () => {
		it("should reject", async () => {
			await expect(review({ backlog: true, apply: true })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockReviewPr).not.toHaveBeenCalled();
		});
	});

	describe("when --backlog is given alone", () => {
		it("should review", async () => {
			await review({ backlog: true });

			expect(mockReviewPr).toHaveBeenCalledWith("/repo", { backlog: true });
		});
	});

	describe("when --checkout-only is given with a PR number", () => {
		it("should check the PR out without reviewing", async () => {
			await review({ checkoutOnly: true, number: "123" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123"],
				{ stdio: "inherit" },
			);
			expect(mockReviewPr).not.toHaveBeenCalled();
		});

		it("should route the checkout through the worktree allocator", async () => {
			await review({ checkoutOnly: true, number: "123" });

			expect(mockMoveToPrCheckoutTree).toHaveBeenCalled();
		});

		it("should start an idle Claude session with no prompt", async () => {
			await review({ checkoutOnly: true, number: "123" });

			const [prompt, options] = mockSpawnClaude.mock.calls[0];
			expect(prompt).toBe("");
			expect(options).toMatchObject({
				permissionMode: "acceptEdits",
				sessionId: expect.any(String),
			});
		});

		it("should announce the activity under the spawned session's id so the card stays alive", async () => {
			await review({ checkoutOnly: true, number: "123" });

			const { sessionId } = mockSpawnClaude.mock.calls[0][1] as {
				sessionId: string;
			};
			expect(mockEmitActivity).toHaveBeenCalledWith({
				kind: "command",
				name: "review",
				claudeSessionId: sessionId,
			});
		});
	});

	describe("when --checkout-only is given without a PR number", () => {
		it("should reject", async () => {
			await expect(review({ checkoutOnly: true })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockError).toHaveBeenCalledWith(
				"Error: --checkout-only requires a PR number.",
			);
			expect(mockSpawnClaude).not.toHaveBeenCalled();
		});
	});

	describe.each(["refine", "apply", "backlog", "submit"] as const)(
		"when --checkout-only is combined with --%s",
		(flag) => {
			it("should reject", async () => {
				await expect(
					review({ checkoutOnly: true, number: "123", [flag]: true }),
				).rejects.toThrow("process.exit");
				expect(mockExit).toHaveBeenCalledWith(1);
				expect(mockError).toHaveBeenCalledWith(
					"Error: --checkout-only cannot be combined with --refine, --apply, --backlog or --submit.",
				);
				expect(mockExecFileSync).not.toHaveBeenCalled();
				expect(mockSpawnClaude).not.toHaveBeenCalled();
			});
		},
	);
});
