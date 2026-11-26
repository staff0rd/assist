import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { baseRepoFetchSource } from "../prs/baseRepoFetchSource";
import { resolveBaseRepo } from "../prs/resolveBaseRepo";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { azCliProblem } from "./azCliProblem";
import { azureDevopsRemote } from "./azureDevopsRemote";
import { checkoutPr } from "./checkoutPr";
import { clearStalePrBranch } from "./clearStalePrBranch";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";
import { prHeadBranch } from "./prHeadBranch";
import { reinstallChangedDeps } from "./reinstallChangedDeps";
import { reportCwdToDaemon } from "./reportCwdToDaemon";
import { syncReusedCheckout } from "./syncReusedCheckout";
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
vi.mock("./azureDevopsRemote", () => ({ azureDevopsRemote: vi.fn() }));
vi.mock("./azCliProblem", () => ({ azCliProblem: vi.fn() }));
vi.mock("./moveToPrCheckoutTree", () => ({
	moveToPrCheckoutTree: vi.fn(),
}));
vi.mock("./prHeadBranch", () => ({ prHeadBranch: vi.fn() }));
vi.mock("../prs/resolveBaseRepo", () => ({ resolveBaseRepo: vi.fn() }));
vi.mock("../prs/baseRepoFetchSource", () => ({
	baseRepoFetchSource: vi.fn(),
}));
vi.mock("./reinstallChangedDeps", () => ({ reinstallChangedDeps: vi.fn() }));
vi.mock("./reportCwdToDaemon", () => ({ reportCwdToDaemon: vi.fn() }));
vi.mock("./syncReusedCheckout", () => ({ syncReusedCheckout: vi.fn() }));
vi.mock("./worktreeHoldingBranch", () => ({
	worktreeHoldingBranch: vi.fn(),
}));

const gitMock = vi.mocked(gitSyncOrNull);
const headBranchMock = vi.mocked(prHeadBranch);
const staleMock = vi.mocked(clearStalePrBranch);
const holderMock = vi.mocked(worktreeHoldingBranch);
const moveMock = vi.mocked(moveToPrCheckoutTree);
const remoteMock = vi.mocked(azureDevopsRemote);
const baseRepoMock = vi.mocked(resolveBaseRepo);
const fetchSourceMock = vi.mocked(baseRepoFetchSource);

const ORIGIN = { org: "Turtlator", repo: "assist" };

let chdir: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	chdir = vi.spyOn(process, "chdir").mockImplementation(() => {});
	headBranchMock.mockReturnValue("feature");
	holderMock.mockReturnValue(null);
	gitMock.mockReturnValue("other-branch");
	staleMock.mockReturnValue("absent");
	remoteMock.mockReturnValue(null);
	baseRepoMock.mockReturnValue({ base: ORIGIN, origin: ORIGIN, mode: "auto" });
	fetchSourceMock.mockReturnValue("origin");
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
			expect(reinstallChangedDeps).not.toHaveBeenCalled();
			expect(chdir).not.toHaveBeenCalled();
			expect(reportCwdToDaemon).not.toHaveBeenCalled();
		});

		it("syncs the branch to the PR's current head", async () => {
			gitMock.mockReturnValue("feature");

			await checkoutPr("123");

			expect(syncReusedCheckout).toHaveBeenCalledWith("123", "feature", {
				remote: "origin",
				ref: "refs/pull/123/head",
			});
		});
	});

	describe("in a fork clone", () => {
		beforeEach(() => {
			baseRepoMock.mockReturnValue({
				base: { org: "staff0rd", repo: "assist" },
				origin: ORIGIN,
				mode: "auto",
			});
			fetchSourceMock.mockReturnValue("upstream");
		});

		it("checks out the parent repo's PR", async () => {
			await checkoutPr("123");

			expect(headBranchMock.mock.calls[0][0].headBranch.args.slice(-2)).toEqual(
				["-R", "staff0rd/assist"],
			);
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123", "-R", "staff0rd/assist"],
				{ stdio: "inherit" },
			);
		});

		it("syncs a reused checkout from the remote that points at the parent", async () => {
			gitMock.mockReturnValue("feature");

			await checkoutPr("123");

			expect(syncReusedCheckout).toHaveBeenCalledWith("123", "feature", {
				remote: "upstream",
				ref: "refs/pull/123/head",
			});
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

		it("syncs that worktree's branch from the Azure DevOps source branch", async () => {
			holderMock.mockReturnValue("/git/repo");
			remoteMock.mockReturnValue({ org: "acme", project: "p", repo: "r" });

			await checkoutPr("42");

			expect(syncReusedCheckout).toHaveBeenCalledWith("42", "feature", {
				remote: "origin",
				ref: "refs/heads/feature",
			});
		});
	});

	describe("when the PR's branch is checked out nowhere", () => {
		it("allocates a tree and checks the PR out there", async () => {
			await checkoutPr("123");

			expect(moveMock).toHaveBeenCalled();
			expect(syncReusedCheckout).not.toHaveBeenCalled();
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				["pr", "checkout", "123", "-R", "Turtlator/assist"],
				{ stdio: "inherit" },
			);
		});

		it("reinstalls deps against the commit it left", async () => {
			gitMock.mockImplementation((_cwd, args) =>
				args[0] === "rev-parse" && args[1] === "HEAD" ? "abc123" : "main",
			);

			await checkoutPr("123");

			expect(reinstallChangedDeps).toHaveBeenCalledWith(
				process.cwd(),
				"abc123",
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
				["pr", "checkout", "123", "-R", "Turtlator/assist"],
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

		it("diagnoses the az CLI when an Azure DevOps checkout fails", async () => {
			remoteMock.mockReturnValue({ org: "acme", project: "p", repo: "r" });
			vi.mocked(azCliProblem).mockReturnValue("az is not logged in");

			await expect(checkoutPr("42")).rejects.toThrow("exit");

			const printed = errors.mock.calls.map(([line]: unknown[]) =>
				String(line),
			);
			expect(printed[0]).toContain("az is not logged in");
			expect(printed[1]).toContain("az repos pr checkout --id 42 failed");
		});
	});

	describe("on an Azure DevOps clone", () => {
		it("checks the PR out with az repos pr checkout", async () => {
			remoteMock.mockReturnValue({ org: "acme", project: "p", repo: "r" });
			mockExecFileSync.mockReset();

			await checkoutPr("42");

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"az",
				["repos", "pr", "checkout", "--id", "42"],
				{ stdio: "inherit" },
			);
		});
	});
});
