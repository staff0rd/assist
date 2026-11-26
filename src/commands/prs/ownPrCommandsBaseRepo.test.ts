import { homedir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();
const mockSpawnSync = vi.fn();
vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
	execSync: () => "fix-poll\n",
	spawnSync: (...args: unknown[]) => mockSpawnSync(...args),
}));

const mockResolveBaseRepo = vi.fn();
vi.mock("./resolveBaseRepo", () => ({
	resolveBaseRepo: (...args: unknown[]) => mockResolveBaseRepo(...args),
}));
vi.mock("../review/azureDevopsRemote", () => ({
	azureDevopsRemote: () => null,
}));
const mockUpdateCommentsCache = vi.fn();
vi.mock("./listComments/updateCommentsCache", () => ({
	updateCommentsCache: (...args: unknown[]) => mockUpdateCommentsCache(...args),
}));

import { listComments } from "./listComments";
import { prs } from "./prs";
import { reply } from "./reply";
import { threadTarget } from "./threadTarget";
import type { LineComment } from "./types";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

const GIT_CONFIG: Record<string, string> = {
	"branch.fix-poll.remote": "origin",
	"branch.fix-poll.merge": "refs/heads/fix-poll",
};

const LINE_COMMENT = {
	id: 99,
	user: { login: "reviewer" },
	path: "a.ts",
	line: 3,
	body: "nit",
	diff_hunk: "@@",
	html_url: "https://example.test/c/99",
};

const THREADS = {
	data: { repository: { pullRequest: { reviewThreads: { nodes: [] } } } },
};

function gh(args: string[]): string {
	if (args[0] === "pr" && args[1] === "view")
		return JSON.stringify({ number: 7 });
	if (args[0] === "pr") return "[]";
	if (args[1] === "graphql") return JSON.stringify(THREADS);
	return JSON.stringify(args[2].endsWith("/comments") ? [LINE_COMMENT] : []);
}

function git(args: string[]): string {
	if (args[0] === "config" && args[2] in GIT_CONFIG)
		return `${GIT_CONFIG[args[2]]}\n`;
	if (args[0] === "remote") return "https://github.com/Turtlator/assist.git\n";
	throw new Error("exit 1");
}

function ghCalls(): string[][] {
	return mockExecFileSync.mock.calls
		.filter(([file]) => file === "gh")
		.map(([, args]) => args);
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	mockExecFileSync.mockImplementation((file: string, args: string[]) =>
		file === "gh" ? gh(args) : git(args),
	);
	mockSpawnSync.mockReturnValue({ status: 0, stdout: "{}", stderr: "" });
});

describe.each([
	{
		clone: "a fork clone",
		base: PARENT,
		slug: "staff0rd/assist",
		selector: "Turtlator:fix-poll",
	},
	{
		clone: "a clone that is not a fork",
		base: ORIGIN,
		slug: "Turtlator/assist",
		selector: "fix-poll",
	},
])("own-PR commands in $clone", ({ base, slug, selector }) => {
	beforeEach(() => {
		mockResolveBaseRepo.mockReturnValue({ base, origin: ORIGIN, mode: "auto" });
	});

	const viewArgs = ["pr", "view", selector, "--json", "number", "-R", slug];
	const replyEndpoint = `repos/${slug}/pulls/7/comments`;

	it("should list the base repo's pull requests", async () => {
		await prs({});

		expect(ghCalls()[0].slice(-2)).toEqual(["-R", slug]);
	});

	it("should fetch comments and threads from the base repo's PR", async () => {
		const { cachePath } = await listComments();

		const calls = ghCalls();
		expect(calls[0]).toEqual(viewArgs);
		expect(calls[1]).toEqual(
			expect.arrayContaining([
				`owner=${base.org}`,
				`repo=${base.repo}`,
				"prNumber=7",
			]),
		);
		expect(calls[2][2]).toBe(`repos/${slug}/pulls/7/reviews`);
		expect(calls[3][2]).toBe(replyEndpoint);
		expect(mockUpdateCommentsCache).toHaveBeenCalledWith(
			base.org,
			base.repo,
			7,
			expect.anything(),
		);
		expect(cachePath).toBe(
			join(
				homedir(),
				".assist",
				"pr-comments",
				base.org,
				base.repo,
				"pr-7-comments.yaml",
			),
		);
	});

	it("should post a reply to the base repo's PR", async () => {
		await reply(99, "Good catch");

		expect(ghCalls()[0]).toEqual(viewArgs);
		expect(mockSpawnSync.mock.calls[0][1][1]).toBe(replyEndpoint);
	});

	it("should key the thread target and its replies off the base repo", () => {
		const target = threadTarget("fixed");

		expect(target).toMatchObject({ ...base, prNumber: 7 });

		target.reply({ id: 99 } as LineComment, "Fixed");

		expect(mockSpawnSync.mock.calls[0][1][1]).toBe(replyEndpoint);
	});
});
