import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { fetchPrChangedFiles } from "./fetchPrDiffInfo";

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
