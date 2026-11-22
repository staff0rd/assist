import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { abortOnConflicts } from "./abortOnConflicts";
import { commitStaged } from "./commitStaged";
import { mergeInProgress } from "./mergeInProgress";

function git(...args: string[]): string {
	return execFileSync("git", args, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
	}).trim();
}

function commitFile(content: string, subject: string): void {
	writeFileSync("file.txt", content);
	git("add", "file.txt");
	git("commit", "-qm", subject);
}

function startConflictingMerge(): void {
	commitFile("base\n", "base");
	git("checkout", "-qb", "other");
	commitFile("other\n", "other");
	git("checkout", "-q", "main");
	commitFile("main\n", "main");
	try {
		git("merge", "other");
	} catch {}
}

function resolveConflict(): void {
	writeFileSync("file.txt", "resolved\n");
	git("add", "file.txt");
}

describe("concluding a merge", () => {
	const cwd = process.cwd();
	let root: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "commit-merge-"));
		process.chdir(root);
		git("init", "-q", "-b", "main");
		git("config", "user.email", "t@example.com");
		git("config", "user.name", "t");
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);
	});

	afterEach(() => {
		process.chdir(cwd);
		rmSync(root, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("is not merging outside a merge", () => {
		commitFile("base\n", "base");

		expect(mergeInProgress()).toBe(false);
	});

	it("refuses while unmerged paths remain", () => {
		startConflictingMerge();

		expect(mergeInProgress()).toBe(true);
		expect(() => abortOnConflicts([], false, true)).toThrow("exit");
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it("refuses when staged conflict markers remain", () => {
		startConflictingMerge();
		git("add", "file.txt");

		expect(() => abortOnConflicts([], false, true)).toThrow("exit");
	});

	it("keeps git's prepared message and both parents with no message", () => {
		startConflictingMerge();
		resolveConflict();

		abortOnConflicts([], false, true);
		commitStaged(null);

		expect(git("log", "-1", "--format=%s")).toBe("Merge branch 'other'");
		expect(git("log", "-1", "--format=%P").split(" ")).toHaveLength(2);
		expect(mergeInProgress()).toBe(false);
	});

	it("uses a given message for the merge commit", () => {
		startConflictingMerge();
		resolveConflict();

		commitStaged("fix: merge other");

		expect(git("log", "-1", "--format=%s")).toBe("fix: merge other");
		expect(git("log", "-1", "--format=%P").split(" ")).toHaveLength(2);
	});
});
