import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

import { create } from "./create";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("create", () => {
	describe("when title or body is missing", () => {
		it("should reject without calling gh", () => {
			expect(() => create({ title: "Add feature" })).toThrow("process.exit");
			expect(mockExecSync).not.toHaveBeenCalled();
		});
	});

	describe("when the body references Claude", () => {
		it("should reject without calling gh", () => {
			expect(() =>
				create({ title: "Add feature", body: "Written by Claude" }),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecSync).not.toHaveBeenCalled();
		});
	});

	describe("when the title and body are valid", () => {
		it("should delegate to gh pr create with title and body", () => {
			create({ title: "Add feature", body: "Adds the feature." });

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr create --title 'Add feature' --body 'Adds the feature.'",
				{ stdio: "inherit" },
			);
		});

		it("should pass through optional flags", () => {
			create({
				title: "Add feature",
				body: "Adds the feature.",
				base: "main",
				head: "feature-branch",
				draft: true,
				web: true,
				label: ["bug", "good first issue"],
				assignee: ["octocat"],
				reviewer: ["hubot"],
				milestone: "v1.0",
			});

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr create --title 'Add feature' --body 'Adds the feature.' --base main --head feature-branch --milestone v1.0 --draft --web --label bug --label 'good first issue' --assignee octocat --reviewer hubot",
				{ stdio: "inherit" },
			);
		});
	});

	describe("when gh pr create fails", () => {
		it("should exit with code 1", () => {
			mockExecSync.mockImplementation(() => {
				throw new Error("gh failed");
			});

			expect(() =>
				create({ title: "Add feature", body: "Adds the feature." }),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});
});
