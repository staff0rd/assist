import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { gitBranchInfo } from "./gitBranchInfo";
import { type ItemStatusCounts, gitStatus } from "./gitStatus";
import { itemChangeSet } from "./itemChangeSet";

vi.mock("../../../shared/web", () => ({ respondJson: vi.fn() }));
vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./itemChangeSet", () => ({ itemChangeSet: vi.fn() }));
vi.mock("./gitBranchInfo", () => ({ gitBranchInfo: vi.fn() }));

const respondJsonMock = vi.mocked(respondJson);
const execGitMock = vi.mocked(execGit);
const itemChangeSetMock = vi.mocked(itemChangeSet);
const gitBranchInfoMock = vi.mocked(gitBranchInfo);

const NO_BRANCH = {
	branch: null,
	defaultBranch: null,
	onDefaultBranch: false,
};

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

function withChangeSet(groups: { base: string; paths: string[] }[]): void {
	itemChangeSetMock.mockResolvedValue({ commits: [{ sha: "one" }], groups });
}

async function request(url = "/api/git-status?cwd=%2Frepo"): Promise<{
	status: number;
	counts: ItemStatusCounts;
}> {
	await gitStatus({ url } as IncomingMessage, {} as ServerResponse);
	const [, status, counts] = respondJsonMock.mock.lastCall as [
		ServerResponse,
		number,
		ItemStatusCounts,
	];
	return { status, counts };
}

describe("gitStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemChangeSetMock.mockResolvedValue(undefined);
		gitBranchInfoMock.mockResolvedValue(NO_BRANCH);
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/git-status");
		expect(status).toBe(400);
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("reads the working tree from git status when there is no change set", async () => {
		withGit(() => "?? added.ts\n M changed.ts\n D gone.ts\n");

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({
			new: ["added.ts"],
			modified: ["changed.ts"],
			deleted: ["gone.ts"],
			...NO_BRANCH,
		});
		expect(execGitMock).toHaveBeenCalledExactlyOnceWith("/repo", [
			"status",
			"--porcelain",
			"--untracked-files=all",
		]);
	});

	it("counts one --name-status diff per change group", async () => {
		withChangeSet([
			{ base: "base-one", paths: ["a.ts", "b.ts"] },
			{ base: "HEAD", paths: ["z.ts"] },
		]);
		withGit((args) => {
			if (args[1] !== "--name-status") return "";
			return args[2] === "base-one" ? "A\ta.ts\nM\tb.ts\n" : "D\tz.ts\n";
		});

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts.new).toEqual(["a.ts"]);
		expect(counts.modified).toEqual(["b.ts"]);
		expect(counts.deleted).toEqual(["z.ts"]);
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"diff",
			"--name-status",
			"base-one",
			"--",
			"a.ts",
			"b.ts",
		]);
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"diff",
			"--name-status",
			"HEAD",
			"--",
			"z.ts",
		]);
	});

	it("counts a file touched by several of the item's commits once", async () => {
		withChangeSet([{ base: "base-one", paths: ["twice.ts"] }]);
		withGit((args) => (args[1] === "--name-status" ? "M\ttwice.ts\n" : ""));

		const { counts } = await request();

		expect(counts.modified).toEqual(["twice.ts"]);
		expect(counts.new).toEqual([]);
	});

	it("adds untracked files to the item counts", async () => {
		withChangeSet([{ base: "base-one", paths: ["a.ts"] }]);
		withGit((args) => {
			if (args[1] === "--name-status") return "M\ta.ts\n";
			if (args[0] === "ls-files") return "untracked-a.ts\nuntracked-b.ts\n";
			return "";
		});

		const { counts } = await request();

		expect(counts.new).toEqual(["untracked-a.ts", "untracked-b.ts"]);
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"ls-files",
			"--others",
			"--exclude-standard",
		]);
	});

	it("returns the uncommitted subset alongside the item counts", async () => {
		withChangeSet([{ base: "base-one", paths: ["a.ts", "b.ts"] }]);
		withGit((args) => {
			if (args[1] === "--name-status") return "A\ta.ts\nM\tb.ts\n";
			if (args[0] === "status") return " M b.ts\n";
			return "";
		});

		const { counts } = await request();

		expect(counts.uncommitted).toEqual({
			new: [],
			modified: ["b.ts"],
			deleted: [],
		});
		expect(counts.hasCommits).toBe(true);
	});

	it("reports an empty uncommitted subset when the tree is clean", async () => {
		withChangeSet([{ base: "base-one", paths: ["a.ts"] }]);
		withGit((args) => (args[1] === "--name-status" ? "A\ta.ts\n" : ""));

		const { counts } = await request();

		expect(counts.uncommitted).toEqual({ new: [], modified: [], deleted: [] });
	});

	it("omits the item fields when there is no change set", async () => {
		withGit(() => " M changed.ts\n");

		const { counts } = await request();

		expect(counts.uncommitted).toBeUndefined();
		expect(counts.hasCommits).toBeUndefined();
	});

	it("reports the branch the session sits on", async () => {
		gitBranchInfoMock.mockResolvedValue({
			branch: "feature/x",
			defaultBranch: "origin/main",
			onDefaultBranch: false,
		});
		withGit(() => "");

		const { counts } = await request();

		expect(counts.branch).toBe("feature/x");
		expect(counts.defaultBranch).toBe("origin/main");
		expect(counts.onDefaultBranch).toBe(false);
	});

	it("reports the branch alongside an item change set", async () => {
		withChangeSet([{ base: "base-one", paths: ["a.ts"] }]);
		gitBranchInfoMock.mockResolvedValue({
			branch: "main",
			defaultBranch: "origin/main",
			onDefaultBranch: true,
		});
		withGit(() => "");

		const { counts } = await request();

		expect(counts.onDefaultBranch).toBe(true);
		expect(counts.hasCommits).toBe(true);
	});

	it("builds the change set for the requested session", async () => {
		withGit(() => "");

		await request("/api/git-status?cwd=%2Frepo&session=sess-1");

		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", {
			conversationId: "sess-1",
		});
	});

	it("scopes the change set to the requested harness's conversation", async () => {
		withGit(() => "");

		await request("/api/git-status?cwd=%2Frepo&session=thread-1&harness=codex");
		await request("/api/git-status?cwd=%2Frepo&session=x&harness=bogus");

		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", {
			conversationId: "thread-1",
			harness: "codex",
		});
		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", {
			conversationId: "x",
		});
	});

	it("builds the change set without a session when none is given", async () => {
		withGit(() => "");

		await request();

		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", undefined);
	});

	it("returns empty groups when git fails", async () => {
		execGitMock.mockRejectedValue(new Error("not a repo"));

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({ new: [], modified: [], deleted: [] });
	});

	it("falls back to the working tree when the change set lookup fails", async () => {
		itemChangeSetMock.mockRejectedValue(new Error("db down"));
		withGit(() => " M changed.ts\n");

		const { status, counts } = await request();

		expect(status).toBe(200);
		expect(counts).toEqual({
			new: [],
			modified: ["changed.ts"],
			deleted: [],
			...NO_BRANCH,
		});
	});
});
