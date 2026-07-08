import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

const mockFindCurrentPrNumber = vi.fn();
vi.mock("./shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

vi.mock("../../shared/loadJson", () => ({
	loadJson: () => ({ site: "example.atlassian.net" }),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

import { raise } from "./raise";

beforeEach(() => {
	vi.clearAllMocks();
	mockFindCurrentPrNumber.mockReturnValue(null);
});

describe("raise", () => {
	describe("when required sections are missing", () => {
		it("rejects without title", async () => {
			await expect(raise({ what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecSync).not.toHaveBeenCalled();
		});

		it("rejects without what", async () => {
			await expect(raise({ title: "t", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecSync).not.toHaveBeenCalled();
		});

		it("rejects without why", async () => {
			await expect(raise({ title: "t", what: "w" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecSync).not.toHaveBeenCalled();
		});
	});

	describe("when the title references Claude", () => {
		it("rejects without calling gh", async () => {
			await expect(
				raise({ title: "Built by Claude", what: "w", why: "y" }),
			).rejects.toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecSync).not.toHaveBeenCalled();
		});
	});

	describe("when no PR exists", () => {
		it("creates the PR with an assembled body", () => {
			raise({ title: "feat: x", what: "Adds x", why: "Needed x" });

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr create --title 'feat: x' --body '## What\n\nAdds x\n\n## Why\n\nNeeded x'",
				{ stdio: "inherit" },
			);
		});

		it("appends resolved Jira URLs to Why", () => {
			raise({
				title: "feat: x",
				what: "Adds x",
				why: "Needed x",
				resolves: ["BAD-671"],
			});

			expect(mockExecSync).toHaveBeenCalledWith(
				expect.stringContaining(
					"Resolves https://example.atlassian.net/browse/BAD-671",
				),
				{ stdio: "inherit" },
			);
		});
	});

	describe("when a PR already exists", () => {
		beforeEach(() => {
			mockFindCurrentPrNumber.mockReturnValue(42);
		});

		it("errors without --force", async () => {
			await expect(raise({ title: "t", what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecSync).not.toHaveBeenCalled();
		});

		it("overwrites title and body with --force", () => {
			raise({ title: "t", what: "w", why: "y", force: true });

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr edit 42 --title t --body '## What\n\nw\n\n## Why\n\ny'",
				{ stdio: "inherit" },
			);
		});
	});

	describe("when gh fails", () => {
		it("exits with code 1", async () => {
			mockExecSync.mockImplementation(() => {
				throw new Error("gh failed");
			});

			await expect(raise({ title: "t", what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});
});
