import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { fetchPrChangedFiles, fetchPrDiffInfo } from "./fetchPrDiffInfo";

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

describe("fetchPrDiffInfo", () => {
	it("resolves the open PR for the branch via gh pr list", () => {
		setupExec((cmd) => {
			if (cmd.includes("git rev-parse --abbrev-ref HEAD")) return "my-branch";
			if (cmd.includes("gh pr list")) {
				return JSON.stringify([
					{
						number: 131,
						baseRefName: "main",
						baseRefOid: "base-sha",
						headRefName: "my-branch",
						headRefOid: "head-sha",
					},
				]);
			}
			return undefined as unknown as string;
		});

		expect(fetchPrDiffInfo()).toEqual({
			prNumber: 131,
			baseRef: "main",
			baseSha: "base-sha",
			headRef: "my-branch",
			headSha: "head-sha",
		});

		const listCall = mockExecSync.mock.calls
			.map((call) => call[0] as string)
			.find((cmd) => cmd.includes("gh pr list"));
		expect(listCall).toContain("--state open");
		expect(listCall).toContain("--head my-branch");
	});

	it("exits when the branch has no open PR", () => {
		setupExec((cmd) => {
			if (cmd.includes("git rev-parse --abbrev-ref HEAD")) return "my-branch";
			if (cmd.includes("gh pr list")) return "[]";
			return undefined as unknown as string;
		});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);
		const err = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => fetchPrDiffInfo()).toThrow("exit");
		expect(exit).toHaveBeenCalledWith(1);

		exit.mockRestore();
		err.mockRestore();
	});
});

describe("fetchPrChangedFiles", () => {
	it("returns the changed file names", () => {
		setupExec((cmd) => {
			if (cmd.includes("gh api repos/owner/repo/pulls/104/files")) {
				return "src/a.ts\nsrc/b.ts\n";
			}
			return undefined as unknown as string;
		});

		expect(fetchPrChangedFiles(104)).toEqual(["src/a.ts", "src/b.ts"]);
	});

	it("uses the paginated pull request files api", () => {
		setupExec((cmd) => {
			if (cmd.includes("gh api")) return "src/a.ts\n";
			return undefined as unknown as string;
		});

		fetchPrChangedFiles(104);

		const apiCall = mockExecSync.mock.calls
			.map((call) => call[0] as string)
			.find((cmd) => cmd.includes("gh api"));
		expect(apiCall).toContain("repos/owner/repo/pulls/104/files");
		expect(apiCall).toContain("--paginate");
	});
});
