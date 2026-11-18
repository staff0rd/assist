import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import type { AssistConfig } from "../../shared/types";
import { worktreePlaceholderBranch } from "../../shared/worktreePlaceholderBranch";
import { createBranch } from "../branch/createBranch";
import { generateBranchSlug } from "../branch/generateBranchSlug";
import { moveOffPlaceholder } from "./moveOffPlaceholder";
import { placeholderBranchSource } from "./placeholderBranchSource";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("../../shared/worktreePlaceholderBranch", () => ({
	worktreePlaceholderBranch: vi.fn(),
}));
vi.mock("../branch/createBranch", () => ({ createBranch: vi.fn() }));
vi.mock("../branch/generateBranchSlug", () => ({
	generateBranchSlug: vi.fn(async () => "card-layout"),
}));
vi.mock("./placeholderBranchSource", () => ({
	placeholderBranchSource: vi.fn(),
}));
vi.mock("../branch/resolveDefaultBranch", () => ({
	resolveDefaultBranch: () => "main",
}));

const mockPlaceholder = vi.mocked(worktreePlaceholderBranch);
const mockCreate = vi.mocked(createBranch);
const mockExecFile = vi.mocked(execFileSync);
const mockSource = vi.mocked(placeholderBranchSource);
const mockSlug = vi.mocked(generateBranchSlug);

describe("moveOffPlaceholder", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockCreate.mockResolvedValue({
			branchName: "card-layout",
			baseRef: "HEAD",
		});
		mockSource.mockImplementation(async (message) => ({ text: message }));
	});

	it("branches from HEAD off the placeholder and tracks the mainline", async () => {
		mockPlaceholder.mockReturnValue("repo-3");

		await moveOffPlaceholder("fix: card layout", {} as AssistConfig);

		expect(mockSlug).toHaveBeenCalledWith("fix: card layout");
		expect(mockCreate).toHaveBeenCalledWith({
			slug: "card-layout",
			jira: undefined,
			from: "HEAD",
			unique: true,
		});
		expect(mockExecFile).toHaveBeenCalledWith(
			"git",
			["branch", "--set-upstream-to", "origin/main"],
			expect.anything(),
		);
	});

	it("names the branch from the session's item and its Jira key", async () => {
		mockPlaceholder.mockReturnValue("repo-3");
		mockSource.mockResolvedValue({ text: "Card layout", jira: "ABC-12" });

		await moveOffPlaceholder("fix: card layout", {} as AssistConfig);

		expect(mockSlug).toHaveBeenCalledWith("Card layout");
		expect(mockCreate).toHaveBeenCalledWith({
			slug: "card-layout",
			jira: "ABC-12",
			from: "HEAD",
			unique: true,
		});
	});

	it("leaves an already named branch alone", async () => {
		mockPlaceholder.mockReturnValue(null);

		await moveOffPlaceholder("fix: card layout", {} as AssistConfig);

		expect(mockCreate).not.toHaveBeenCalled();
	});

	it("leaves the placeholder alone in trunk mode", async () => {
		mockPlaceholder.mockReturnValue("repo-3");

		await moveOffPlaceholder("fix: card layout", {
			worktree: { trunk: true },
		} as AssistConfig);

		expect(mockCreate).not.toHaveBeenCalled();
		expect(mockPlaceholder).not.toHaveBeenCalled();
	});
});
