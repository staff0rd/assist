import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { checkoutPr } from "./checkoutPr";
import { clearStalePrBranch } from "./clearStalePrBranch";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";
import { prHeadBranch } from "./prHeadBranch";
import { reportCwdToDaemon } from "./reportCwdToDaemon";
import { worktreeHoldingBranch } from "./worktreeHoldingBranch";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);
vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/git", () => ({
	gitSyncOrNull: vi.fn(),
}));
vi.mock("./clearStalePrBranch", () => ({ clearStalePrBranch: vi.fn() }));
vi.mock("./moveToPrCheckoutTree", () => ({
	moveToPrCheckoutTree: vi.fn(),
}));
vi.mock("./prHeadBranch", () => ({ prHeadBranch: vi.fn() }));
vi.mock("./reportCwdToDaemon", () => ({ reportCwdToDaemon: vi.fn() }));
vi.mock("./worktreeHoldingBranch", () => ({
	worktreeHoldingBranch: vi.fn(),
}));

const gitMock = vi.mocked(gitSyncOrNull);
const headBranchMock = vi.mocked(prHeadBranch);
const staleMock = vi.mocked(clearStalePrBranch);
const holderMock = vi.mocked(worktreeHoldingBranch);
const moveMock = vi.mocked(moveToPrCheckoutTree);

let chdir: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	chdir = vi.spyOn(process, "chdir").mockImplementation(() => {});
	headBranchMock.mockReturnValue("feature");
	holderMock.mockReturnValue(null);
	gitMock.mockReturnValue("other-branch");
	staleMock.mockReturnValue("absent");
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("checkoutPr", () => {
	describe("when the PR's branch is already checked out here", () => {
		it("reviews in place without touching the tree", async () => {
			gitMock.mockReturnValue("feature");

			await checkoutPr("123");

			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(moveMock).not.toHaveBeenCalled();
			expect(chdir).not.toHaveBeenCalled();
			expect(reportCwdToDaemon).not.toHaveBeenCalled();
		});
	});

	describe("when another worktree holds the PR's branch", () => {
		it("moves to that worktree instead of checking out over it", async () => {
			holderMock.mockReturnValue("/git/repo");

			await checkoutPr("123");

			expect(chdir).toHaveBeenCalledWith("/git/repo");
			expect(reportCwdToDaemon).toHaveBeenCalledWith("/git/repo");
			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(moveMock).not.toHaveBeenCalled();
		});
	});

	describe("when the PR's branch is checked out nowhere", () => {
		it("allocates a tree and checks the PR out there", async () => {
			await checkoutPr("123");

			expect(moveMock).toHaveBeenCalled();
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123"],
				{ stdio: "inherit" },
			);
		});
	});

	describe("when the PR's head branch cannot be resolved", () => {
		it("falls back to checking the PR out", async () => {
			headBranchMock.mockReturnValue(null);

			await checkoutPr("123");

			expect(moveMock).toHaveBeenCalled();
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123"],
				{ stdio: "inherit" },
			);
		});
	});

	describe("when gh pr checkout fails", () => {
		let errors: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			errors = vi.spyOn(console, "error").mockImplementation(() => {});
			vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("exit");
			});
			mockExecFileSync.mockImplementation(() => {
				gitMock.mockReturnValue("feature");
				throw new Error("gh failed");
			});
		});

		it("returns the tree to the branch it was on", async () => {
			await expect(checkoutPr("123")).rejects.toThrow("exit");

			expect(gitMock).toHaveBeenCalledWith(process.cwd(), [
				"checkout",
				"--quiet",
				"other-branch",
			]);
		});

		it("explains that the local branch holds unpushed work", async () => {
			staleMock.mockReturnValue("local-work");

			await expect(checkoutPr("123")).rejects.toThrow("exit");

			expect(String(errors.mock.calls[0][0])).toContain(
				"Local branch feature has commits that are not on the remote",
			);
		});
	});
});
