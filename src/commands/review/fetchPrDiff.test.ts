import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { fetchPrDiff } from "./fetchPrDiff";

type ExecCall = (cmd: string) => string;

function setupExec(handler: ExecCall): void {
	mockExecSync.mockImplementation((cmd: string) => {
		if (cmd.includes("@{u}")) return "origin/main";
		if (cmd === "git remote") return "origin";
		if (cmd === "git remote get-url origin") {
			return "git@github.com:owner/repo.git";
		}
		const result = handler(cmd);
		if (result === undefined) {
			throw new Error(`Unexpected command: ${cmd}`);
		}
		return result;
	});
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("fetchPrDiff", () => {
	it("returns the diff from gh", () => {
		setupExec((cmd) => {
			if (cmd.startsWith("gh pr diff 104")) return "diff --git a/a b/a\n";
			return undefined as unknown as string;
		});

		expect(fetchPrDiff(104, "base-sha", "head-sha")).toBe(
			"diff --git a/a b/a\n",
		);
	});

	describe("when the diff exceeds the github file limit", () => {
		it("falls back to a local git diff between the base and head shas", () => {
			setupExec((cmd) => {
				if (cmd.startsWith("gh pr diff 104")) {
					throw new Error(
						"HTTP 406: Sorry, the diff exceeded the maximum number of files (300). (PullRequest.diff too_large)",
					);
				}
				if (cmd === "git fetch origin base-sha head-sha") return "";
				if (cmd === "git diff base-sha...head-sha") {
					return "diff --git a/a b/a\n";
				}
				return undefined as unknown as string;
			});

			expect(fetchPrDiff(104, "base-sha", "head-sha")).toBe(
				"diff --git a/a b/a\n",
			);
		});
	});

	describe("when gh fails for another reason", () => {
		it("rethrows the error", () => {
			setupExec((cmd) => {
				if (cmd.startsWith("gh pr diff 104")) {
					throw new Error("HTTP 502: Bad Gateway");
				}
				return undefined as unknown as string;
			});

			expect(() => fetchPrDiff(104, "base-sha", "head-sha")).toThrow(
				"HTTP 502",
			);
		});
	});
});
