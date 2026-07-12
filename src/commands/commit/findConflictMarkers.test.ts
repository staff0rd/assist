import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
	execSync: vi.fn(),
}));

import { execSync } from "node:child_process";
import { findConflictMarkers, findUnmergedPaths } from "./findConflictMarkers";

const mockExecSync = execSync as unknown as ReturnType<typeof vi.fn>;

function checkError(stdout: string): Error {
	const error = new Error("git diff --check exited 2") as Error & {
		stdout: string;
	};
	error.stdout = stdout;
	return error;
}

describe("findConflictMarkers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns files reported with leftover conflict markers", () => {
		mockExecSync.mockImplementation((cmd: string) => {
			if (cmd.startsWith("git diff --check")) {
				throw checkError(
					"src/Home.tsx:2: leftover conflict marker\n" +
						"src/Home.tsx:4: leftover conflict marker\n",
				);
			}
			return "";
		});

		expect(findConflictMarkers(["src/Home.tsx"])).toEqual(["src/Home.tsx"]);
	});

	it("ignores whitespace-only warnings", () => {
		mockExecSync.mockImplementation(
			() => "src/Home.tsx:2: trailing whitespace\n",
		);

		expect(findConflictMarkers(["src/Home.tsx"])).toEqual([]);
	});

	it("checks only the staged index when no files are given", () => {
		const calls: string[] = [];
		mockExecSync.mockImplementation((cmd: string) => {
			calls.push(cmd);
			return "";
		});

		findConflictMarkers([]);

		expect(calls).toEqual(["git diff --cached --check"]);
	});

	it("checks working tree and index scoped to the given files", () => {
		const calls: string[] = [];
		mockExecSync.mockImplementation((cmd: string) => {
			calls.push(cmd);
			return "";
		});

		findConflictMarkers(["a.ts", "b.ts"]);

		expect(calls).toEqual([
			"git diff --check -- a.ts b.ts",
			"git diff --cached --check -- a.ts b.ts",
		]);
	});

	it("returns an empty array when nothing conflicts", () => {
		mockExecSync.mockImplementation(() => "");
		expect(findConflictMarkers(["a.ts"])).toEqual([]);
	});
});

describe("findUnmergedPaths", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns unique unmerged paths from ls-files -u", () => {
		mockExecSync.mockImplementation(
			() =>
				"100644 aaa 1\tfile.txt\n" +
				"100644 bbb 2\tfile.txt\n" +
				"100644 ccc 3\tfile.txt\n" +
				"100644 ddd 1\tother.txt\n",
		);

		expect(findUnmergedPaths()).toEqual(["file.txt", "other.txt"]);
	});

	it("returns an empty array when there are no unmerged paths", () => {
		mockExecSync.mockImplementation(() => "");
		expect(findUnmergedPaths()).toEqual([]);
	});

	it("returns an empty array when git errors", () => {
		mockExecSync.mockImplementation(() => {
			throw new Error("not a git repository");
		});
		expect(findUnmergedPaths()).toEqual([]);
	});
});
