import { execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { pinCurrentPr } from "../prs/pinCurrentPr";
import { fetchPrChangedFiles, fetchPrDiffInfo } from "./fetchPrDiffInfo";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecSync = vi.mocked(execSync);

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

	it("views the pinned PR instead of looking it up by branch", () => {
		setupExec((cmd) => {
			if (cmd.includes("git rev-parse --abbrev-ref HEAD")) return "HEAD";
			if (cmd.includes("gh pr view 77 ")) {
				return JSON.stringify({
					number: 77,
					baseRefName: "main",
					baseRefOid: "base-sha",
					headRefName: "feature",
					headRefOid: "head-sha",
				});
			}
			return undefined as unknown as string;
		});
		pinCurrentPr(77);

		expect(fetchPrDiffInfo()).toMatchObject({
			prNumber: 77,
			headRef: "feature",
		});
		expect(
			mockExecSync.mock.calls.some((call) =>
				(call[0] as string).includes("gh pr list"),
			),
		).toBe(false);
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
