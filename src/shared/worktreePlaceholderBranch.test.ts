import { execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import { linkedWorktree } from "./linkedWorktree";
import { worktreePlaceholderBranch } from "./worktreePlaceholderBranch";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("./linkedWorktree", () => ({ linkedWorktree: vi.fn() }));

const mockLinked = vi.mocked(linkedWorktree);
const mockExec = vi.mocked(execSync);

describe("worktreePlaceholderBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the branch when HEAD is named after the worktree root", () => {
		mockLinked.mockReturnValue({ root: "/git/repo-3", clone: "/git/repo" });
		mockExec.mockReturnValue("repo-3\n" as never);

		expect(worktreePlaceholderBranch()).toBe("repo-3");
	});

	it("returns null on a named branch", () => {
		mockLinked.mockReturnValue({ root: "/git/repo-3", clone: "/git/repo" });
		mockExec.mockReturnValue("feature-x\n" as never);

		expect(worktreePlaceholderBranch()).toBeNull();
	});

	it("returns null outside a linked worktree", () => {
		mockLinked.mockReturnValue(null);

		expect(worktreePlaceholderBranch()).toBeNull();
		expect(mockExec).not.toHaveBeenCalled();
	});
});
