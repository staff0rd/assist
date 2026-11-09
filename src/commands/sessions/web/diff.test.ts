import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { diff } from "./diff";
import { execGit } from "./execGit";
import { itemChangeSet } from "./itemChangeSet";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./itemChangeSet", () => ({ itemChangeSet: vi.fn() }));
vi.mock("./itemScopeCommits", () => ({ itemScopeCommits: vi.fn() }));

const execGitMock = vi.mocked(execGit);
const itemChangeSetMock = vi.mocked(itemChangeSet);
const itemScopeCommitsMock = vi.mocked(itemScopeCommits);

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

async function request(url = "/api/diff?cwd=%2Frepo"): Promise<{
	status: number;
	body: string;
}> {
	let status = 0;
	let body = "";
	const res = {
		writeHead: (code: number) => {
			status = code;
		},
		end: (chunk?: string) => {
			body = chunk ?? "";
		},
	} as unknown as ServerResponse;
	await diff({ url } as IncomingMessage, res);
	return { status, body };
}

describe("diff", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemChangeSetMock.mockResolvedValue(undefined);
		itemScopeCommitsMock.mockResolvedValue([]);
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/diff");
		expect(status).toBe(400);
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("diffs the working tree against HEAD when there is no change set", async () => {
		withGit((args) => (args[0] === "diff" ? "tracked patch\n" : ""));

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toBe("tracked patch\n");
		expect(execGitMock).toHaveBeenCalledWith("/repo", ["diff", "HEAD"], {
			maxBuffer: 50 * 1024 * 1024,
		});
	});

	it("appends a patch for every untracked file", async () => {
		withGit((args) => {
			if (args[0] === "ls-files") return "added.ts\n";
			if (args.includes("--no-index")) return "untracked patch\n";
			return "tracked patch\n";
		});

		const { body } = await request();

		expect(body).toBe("tracked patch\nuntracked patch\n");
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "--no-index", "--", "/dev/null", "added.ts"],
			{ maxBuffer: 50 * 1024 * 1024, allowFailure: true },
		);
	});

	it("concatenates one diff per change-set group", async () => {
		itemChangeSetMock.mockResolvedValue({
			commits: [{ sha: "one" }],
			groups: [
				{ base: "base-one", paths: ["a.ts", "b.ts"] },
				{ base: "HEAD", paths: ["z.ts"] },
			],
		});
		withGit((args) => (args[0] === "diff" ? `${args[1]} patch\n` : ""));

		const { body } = await request();

		expect(body).toBe("base-one patch\nHEAD patch\n");
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "base-one", "--", "a.ts", "b.ts"],
			{ maxBuffer: 50 * 1024 * 1024 },
		);
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["diff", "HEAD", "--", "z.ts"],
			{ maxBuffer: 50 * 1024 * 1024 },
		);
	});

	it("resolves the change set for the requested session", async () => {
		withGit(() => "");

		await request("/api/diff?cwd=%2Frepo&session=sess-1");

		expect(itemChangeSetMock).toHaveBeenCalledWith("/repo", {
			conversationId: "sess-1",
		});
	});

	it("diffs the working tree against HEAD for the uncommitted scope", async () => {
		itemChangeSetMock.mockResolvedValue({
			commits: [{ sha: "one" }],
			groups: [{ base: "base-one", paths: ["a.ts"] }],
		});
		withGit((args) => (args[0] === "diff" ? "tracked patch\n" : ""));

		const { body } = await request(
			"/api/diff?cwd=%2Frepo&session=sess-1&scope=uncommitted",
		);

		expect(body).toBe("tracked patch\n");
		expect(itemChangeSetMock).not.toHaveBeenCalled();
		expect(execGitMock).toHaveBeenCalledWith("/repo", ["diff", "HEAD"], {
			maxBuffer: 50 * 1024 * 1024,
		});
	});

	it("diffs a recorded commit against its own parent", async () => {
		itemScopeCommitsMock.mockResolvedValue([{ sha: "one" }]);
		withGit((args) => {
			if (args[0] === "rev-parse") return "base-one\n";
			if (args[0] === "diff-tree") return "a.ts\n";
			if (args[0] === "diff") return `${args[1]}..${args[2]} patch\n`;
			return "";
		});

		const { status, body } = await request(
			"/api/diff?cwd=%2Frepo&session=sess-1&scope=one",
		);

		expect(status).toBe(200);
		expect(body).toBe("base-one..one patch\n");
		expect(execGitMock).not.toHaveBeenCalledWith(
			"/repo",
			expect.arrayContaining(["ls-files"]),
			expect.anything(),
		);
	});

	it("bases a recorded root commit on the empty tree", async () => {
		itemScopeCommitsMock.mockResolvedValue([{ sha: "root" }]);
		withGit((args) => {
			if (args[0] === "rev-parse") throw new Error("no parent");
			if (args[0] === "diff") return `${args[1]}..${args[2]} patch\n`;
			return "";
		});

		const { body } = await request(
			"/api/diff?cwd=%2Frepo&session=sess-1&scope=root",
		);

		expect(body).toBe("4b825dc642cb6eb9a060e54bf8d69288fbee4904..root patch\n");
	});

	it("returns an empty body for a recorded commit missing from the repo", async () => {
		itemScopeCommitsMock.mockResolvedValue([{ sha: "gone" }]);
		withGit((args) => {
			if (args[0] === "cat-file") throw new Error("missing object");
			return "should not be reached\n";
		});

		const { status, body } = await request(
			"/api/diff?cwd=%2Frepo&session=sess-1&scope=gone",
		);

		expect(status).toBe(200);
		expect(body).toBe("");
	});

	it("rejects a scope that is not one of the item's commits", async () => {
		itemScopeCommitsMock.mockResolvedValue([{ sha: "one" }]);

		const { status, body } = await request(
			"/api/diff?cwd=%2Frepo&session=sess-1&scope=deadbeef",
		);

		expect(status).toBe(400);
		expect(body).toBe(JSON.stringify({ error: "Invalid scope" }));
		expect(execGitMock).not.toHaveBeenCalled();
		expect(itemChangeSetMock).not.toHaveBeenCalled();
	});

	it("returns an empty body when git fails", async () => {
		execGitMock.mockRejectedValue(new Error("not a repo"));

		const { status, body } = await request();

		expect(status).toBe(500);
		expect(body).toBe("");
	});
});
