import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();
const mockSpawnSync = vi.fn();
vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
	execSync: () => "fix-poll\n",
	spawnSync: (...args: unknown[]) => mockSpawnSync(...args),
}));

const mockResolveBaseRepo = vi.fn();
vi.mock("../prs/resolveBaseRepo", () => ({
	resolveBaseRepo: (...args: unknown[]) => mockResolveBaseRepo(...args),
}));
vi.mock("../prs/baseRepoFetchSource", () => ({
	baseRepoFetchSource: () => "upstream",
}));

import { fetchExistingComments } from "./fetchExistingComments";
import { fetchPrDiff } from "./fetchPrDiff";
import { fetchPrDiffInfo } from "./fetchPrDiffInfo";
import { submitBodyOnlyReview } from "./submitBodyOnlyReview";
import { fetchPrChangedFiles } from "./fetchPrChangedFiles";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

const GIT_CONFIG: Record<string, string> = {
	"branch.fix-poll.remote": "origin",
	"branch.fix-poll.merge": "refs/heads/fix-poll",
};

const PR = {
	number: 7,
	id: "PR_node",
	state: "OPEN",
	baseRefName: "main",
	baseRefOid: "base-sha",
	headRefName: "fix-poll",
	headRefOid: "head-sha",
};

const THREADS = {
	data: { repository: { pullRequest: { reviewThreads: { nodes: [] } } } },
};

let diffTooLarge = false;

function gh(args: string[]): string {
	if (args[0] === "pr" && args[1] === "view") return JSON.stringify(PR);
	if (args[0] === "pr" && args[1] === "list") return JSON.stringify([PR]);
	if (args[0] === "pr" && args[1] === "diff") {
		if (diffTooLarge) throw new Error("PullRequest.diff too_large");
		return "diff --git a/a b/a\n";
	}
	if (args[1] === "graphql") return JSON.stringify(THREADS);
	return "";
}

function git(args: string[]): string {
	if (args[0] === "config" && args[2] in GIT_CONFIG)
		return `${GIT_CONFIG[args[2]]}\n`;
	if (args[0] === "remote") return "https://github.com/Turtlator/assist.git\n";
	if (args[0] === "fetch" || args[0] === "diff") return "local diff\n";
	throw new Error("exit 1");
}

function calls(file: string): string[][] {
	return mockExecFileSync.mock.calls
		.filter(([called]) => called === file)
		.map(([, args]) => args);
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	diffTooLarge = false;
	mockExecFileSync.mockImplementation((file: string, args: string[]) =>
		file === "gh" ? gh(args) : git(args),
	);
	mockSpawnSync.mockReturnValue({ status: 0, stdout: "{}", stderr: "" });
});

describe("review in a fork clone", () => {
	beforeEach(() => {
		mockResolveBaseRepo.mockReturnValue({
			base: PARENT,
			origin: ORIGIN,
			mode: "auto",
		});
	});

	it("should resolve the current branch's open PR in the parent by fork-owner selector", () => {
		expect(fetchPrDiffInfo()).toEqual({
			prNumber: 7,
			baseRef: "main",
			baseSha: "base-sha",
			headRef: "fix-poll",
			headSha: "head-sha",
		});
		expect(calls("gh")[0]).toEqual([
			"pr",
			"view",
			"Turtlator:fix-poll",
			"--json",
			"number,baseRefName,baseRefOid,headRefName,headRefOid,state",
			"-R",
			"staff0rd/assist",
		]);
	});

	it("should treat a closed parent PR as no open PR", () => {
		PR.state = "MERGED";
		const exit = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => fetchPrDiffInfo()).toThrow("exit");

		PR.state = "OPEN";
		exit.mockRestore();
	});

	it("should fetch the diff and changed files from the parent", () => {
		fetchPrDiff(7, "base-sha", "head-sha");
		fetchPrChangedFiles(7);

		const [diff, files] = calls("gh");
		expect(diff).toEqual(["pr", "diff", "7", "-R", "staff0rd/assist"]);
		expect(files[1]).toBe("repos/staff0rd/assist/pulls/7/files");
	});

	it("should fetch an oversized diff's commits from the remote that points at the parent", () => {
		diffTooLarge = true;

		expect(fetchPrDiff(7, "base-sha", "head-sha")).toBe("local diff\n");

		expect(calls("git")).toContainEqual([
			"fetch",
			"upstream",
			"base-sha",
			"head-sha",
		]);
	});

	it("should fetch prior review comments from the parent's PR", () => {
		fetchExistingComments();

		const [view, comments] = calls("gh");
		expect(view.slice(-2)).toEqual(["-R", "staff0rd/assist"]);
		expect(view[2]).toBe("Turtlator:fix-poll");
		expect(comments).toContain("repos/staff0rd/assist/pulls/7/comments");
	});

	it("should submit the review to the parent's PR", () => {
		expect(submitBodyOnlyReview("Looks good")).toBe(true);

		expect(calls("gh")[0]).toEqual([
			"pr",
			"view",
			"Turtlator:fix-poll",
			"--json",
			"id",
			"-R",
			"staff0rd/assist",
		]);
		expect(mockSpawnSync.mock.calls[0][1]).toContain("prId=PR_node");
	});
});

describe("review in a clone that is not a fork", () => {
	beforeEach(() => {
		mockResolveBaseRepo.mockReturnValue({
			base: ORIGIN,
			origin: ORIGIN,
			mode: "auto",
		});
	});

	it("should resolve the open PR by branch name in origin", () => {
		fetchPrDiffInfo();

		expect(calls("gh")[0]).toEqual([
			"pr",
			"list",
			"--state",
			"open",
			"--head",
			"fix-poll",
			"--json",
			"number,baseRefName,baseRefOid,headRefName,headRefOid",
			"-R",
			"Turtlator/assist",
		]);
	});

	it("should fetch the diff from origin", () => {
		fetchPrDiff(7, "base-sha", "head-sha");

		expect(calls("gh")[0]).toEqual([
			"pr",
			"diff",
			"7",
			"-R",
			"Turtlator/assist",
		]);
	});
});
