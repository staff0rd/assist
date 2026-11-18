import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import type { AssistConfig } from "../../shared/types";
import { worktreePlaceholderBranch } from "../../shared/worktreePlaceholderBranch";
import { createBranch } from "../branch/createBranch";
import { moveOffPlaceholder } from "./moveOffPlaceholder";

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
vi.mock("../branch/resolveDefaultBranch", () => ({
	resolveDefaultBranch: () => "main",
}));

const mockPlaceholder = vi.mocked(worktreePlaceholderBranch);
const mockCreate = vi.mocked(createBranch);
const mockExecFile = vi.mocked(execFileSync);

describe("moveOffPlaceholder", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockCreate.mockResolvedValue({
			branchName: "card-layout",
			baseRef: "HEAD",
		});
	});

	it("branches from HEAD off the placeholder and tracks the mainline", async () => {
		mockPlaceholder.mockReturnValue("repo-3");

		await moveOffPlaceholder("fix: card layout", {} as AssistConfig);

		expect(mockCreate).toHaveBeenCalledWith({
			slug: "card-layout",
			from: "HEAD",
		});
		expect(mockExecFile).toHaveBeenCalledWith(
			"git",
			["branch", "--set-upstream-to", "origin/main"],
			expect.anything(),
		);
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
