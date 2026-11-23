import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";

const mockRespondJson = vi.fn();
vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

const mockExecFile = vi.fn();
const mockExecFileSync = vi.fn();
vi.mock("node:child_process", () => ({
	execFile: (...args: unknown[]) => mockExecFile(...args),
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

const mockGetPreferredRemoteRepo = vi.fn();
vi.mock("../../prs/getPreferredRemoteRepo", () => ({
	getPreferredRemoteRepo: () => mockGetPreferredRemoteRepo(),
}));

const mockFindForkParent = vi.fn();
vi.mock("../../prs/findForkParent", () => ({
	findForkParent: () => mockFindForkParent(),
}));

const mockLoadConfigFrom = vi.fn();
vi.mock("../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: () => mockLoadConfigFrom(),
}));

vi.mock("../../backlog/getCurrentOrigin", () => ({
	resolveCurrentOrigin: () => ({
		origin: "github.com/Turtlator/assist",
		stable: true,
	}),
}));

import { nextScope } from "./next/nextScope";
import { prStatus } from "./prStatus";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

const PR = {
	number: 7,
	title: "Fix poll",
	author: { login: "turtlator" },
	createdAt: "2026-11-01T00:00:00Z",
	url: "https://github.com/staff0rd/assist/pull/7",
	isDraft: false,
	state: "OPEN",
};

const GIT_CONFIG: Record<string, string> = {
	"branch.fix-poll.remote": "origin",
	"branch.fix-poll.merge": "refs/heads/fix-poll",
};

type Callback = (error: unknown, result?: { stdout: string }) => void;

let prState = "OPEN";
let cloneCount = 0;

function nextCwd(): string {
	cloneCount += 1;
	return `/clones/${cloneCount}`;
}

function ghCalls(): string[][] {
	return mockExecFile.mock.calls
		.filter(([file]) => file === "gh")
		.map(([, args]) => args as string[]);
}

async function status(query = ""): Promise<unknown> {
	await prStatus(
		{ url: `/api/pr-status?cwd=${nextCwd()}${query}` } as IncomingMessage,
		{} as ServerResponse,
	);
	const [, , body] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		{ pr: { number: number; url: string } | null },
	];
	return body.pr;
}

beforeEach(() => {
	vi.clearAllMocks();
	prState = "OPEN";
	mockGetPreferredRemoteRepo.mockReturnValue(ORIGIN);
	mockFindForkParent.mockReturnValue(PARENT);
	mockLoadConfigFrom.mockReturnValue(makeAssistConfig());
	mockExecFile.mockImplementation((file: string, args: string[], ...rest) => {
		const callback = rest.at(-1) as Callback;
		if (file === "git") return callback(null, { stdout: "fix-poll\n" });
		const pr = { ...PR, state: prState };
		callback(null, {
			stdout: JSON.stringify(args[1] === "list" ? [pr] : pr),
		});
	});
	mockExecFileSync.mockImplementation((_file: string, args: string[]) => {
		if (args[0] === "config" && args[2] in GIT_CONFIG)
			return `${GIT_CONFIG[args[2]]}\n`;
		if (args[0] === "remote")
			return "https://github.com/Turtlator/assist.git\n";
		throw new Error("exit 1");
	});
});

describe("prStatus", () => {
	describe("in a fork clone", () => {
		it("should look up the branch's PR in the parent by fork-owner:branch", async () => {
			const pr = await status();

			expect(ghCalls()).toEqual([
				[
					"pr",
					"view",
					"--json",
					"number,title,author,createdAt,url,isDraft,state",
					"Turtlator:fix-poll",
					"-R",
					"staff0rd/assist",
				],
			]);
			expect(pr).toMatchObject({ number: 7, url: PR.url });
		});

		it("should report no PR when the parent PR is no longer open", async () => {
			prState = "MERGED";

			expect(await status()).toBeNull();
		});

		it("should look up a PR number in the parent", async () => {
			await status("&number=7");

			expect(ghCalls()[0].slice(-3)).toEqual(["7", "-R", "staff0rd/assist"]);
		});
	});

	describe("in a fork clone pinned to origin", () => {
		it("should look up the branch's PR in the fork", async () => {
			mockLoadConfigFrom.mockReturnValue(
				makeAssistConfig({ prs: { baseRepo: "origin" } }),
			);

			await status();

			expect(ghCalls()[0].slice(0, 2)).toEqual(["pr", "list"]);
			expect(ghCalls()[0].slice(-2)).toEqual(["--head", "fix-poll"]);
			expect(ghCalls()[0]).not.toContain("-R");
		});
	});

	describe.each(["not-a-fork", "lookup-failed"])(
		"in a clone whose fork lookup is %s",
		(lookup) => {
			beforeEach(() => mockFindForkParent.mockReturnValue(lookup));

			it("should look up the branch's PR in origin", async () => {
				await status();

				expect(ghCalls()[0].slice(-2)).toEqual(["--head", "fix-poll"]);
				expect(ghCalls()[0]).not.toContain("-R");
			});

			it("should look up a PR number in origin", async () => {
				await status("&number=7");

				expect(ghCalls()[0].at(-1)).toBe("7");
			});
		},
	);
});

describe("nextScope", () => {
	it("should default to the parent repo in a fork clone", () => {
		expect(nextScope(nextCwd()).selfRepo).toBe("staff0rd/assist");
	});

	it("should default to the fork in a fork clone pinned to origin", () => {
		mockLoadConfigFrom.mockReturnValue(
			makeAssistConfig({ prs: { baseRepo: "origin" } }),
		);

		expect(nextScope(nextCwd()).selfRepo).toBe("Turtlator/assist");
	});

	it("should default to origin in a clone that is not a fork", () => {
		mockFindForkParent.mockReturnValue("not-a-fork");

		expect(nextScope(nextCwd()).selfRepo).toBe("Turtlator/assist");
	});

	it("should default to origin when a pinned parent cannot be resolved", () => {
		mockLoadConfigFrom.mockReturnValue(
			makeAssistConfig({ prs: { baseRepo: "parent" } }),
		);
		mockFindForkParent.mockReturnValue("lookup-failed");

		expect(nextScope(nextCwd()).selfRepo).toBe("Turtlator/assist");
	});
});
