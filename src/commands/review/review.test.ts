import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();
const mockReviewPr = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
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

import { review } from "./review";

beforeEach(() => {
	vi.clearAllMocks();
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
});
