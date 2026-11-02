import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pullKeepingIndex } from "./pullKeepingIndex";

function sh(cmd: string, cwd: string): string {
	return execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" });
}

function commitAll(cwd: string, message: string): void {
	sh(`git add -A && git commit -q -m "${message}"`, cwd);
}

let root: string;
let local: string;
let other: string;
const originalCwd = process.cwd();

function initRepos(): void {
	root = mkdtempSync(join(tmpdir(), "assist-pull-index-"));
	const remote = join(root, "remote.git");
	local = join(root, "local");
	other = join(root, "other");
	sh(`git init -q --bare -b main "${remote}"`, root);
	sh(`git clone -q "${remote}" local`, root);
	sh("git config user.email t@t && git config user.name t", local);
	writeFileSync(join(local, "tracked.txt"), "one\n");
	writeFileSync(join(local, "doomed.txt"), "bye\n");
	writeFileSync(join(local, "partial.txt"), "a\n");
	commitAll(local, "init");
	sh("git push -q -u origin main", local);
	sh(`git clone -q "${remote}" other`, root);
	sh("git config user.email t@t && git config user.name t", other);
	writeFileSync(join(other, "upstream.txt"), "new\n");
	commitAll(other, "upstream");
	sh("git push -q", other);
}

describe("pullKeepingIndex", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		for (const key of ["GIT_DIR", "GIT_INDEX_FILE", "GIT_WORK_TREE"]) {
			vi.stubEnv(key, undefined);
		}
		initRepos();
		process.chdir(local);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		vi.unstubAllEnvs();
		rmSync(root, { recursive: true, force: true });
	});

	it("keeps staged edits, deletions and new files staged across the pull", () => {
		writeFileSync(join(local, "tracked.txt"), "two\n");
		writeFileSync(join(local, "added.txt"), "hi\n");
		sh("git rm -q doomed.txt && git add tracked.txt added.txt", local);

		pullKeepingIndex();

		expect(sh("git log -1 --format=%s origin/main", local).trim()).toBe(
			"upstream",
		);
		expect(sh("git diff --cached --name-status", local)).toBe(
			"A\tadded.txt\nD\tdoomed.txt\nM\ttracked.txt\n",
		);
		expect(sh("git diff --name-only", local)).toBe("");
	});

	it("restores only the staged hunks when diff config changes porcelain output", () => {
		sh("git config diff.noprefix true && git config color.diff always", local);
		writeFileSync(join(local, "partial.txt"), "a\nb\n");
		sh("git add partial.txt", local);
		writeFileSync(join(local, "partial.txt"), "a\nb\nc\n");

		pullKeepingIndex();

		expect(sh("git show :partial.txt", local)).toBe("a\nb\n");
		expect(sh("git diff --name-only", local)).toBe("partial.txt\n");
	});

	it("stages the merged file when the pull also changed a staged path", () => {
		writeFileSync(join(other, "partial.txt"), "upstream\na\n");
		commitAll(other, "upstream edit");
		sh("git push -q", other);
		writeFileSync(join(local, "partial.txt"), "a\nlocal\n");
		sh("git add partial.txt", local);

		pullKeepingIndex();

		expect(sh("git show :partial.txt", local)).toBe("upstream\na\nlocal\n");
		expect(sh("git diff --name-only", local)).toBe("");
	});

	it("refuses with the stash SHA when the autostash is left unapplied", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		writeFileSync(join(other, "tracked.txt"), "upstream\n");
		commitAll(other, "upstream edit");
		sh("git push -q", other);
		writeFileSync(join(local, "tracked.txt"), "local\n");
		sh("git add tracked.txt", local);

		let thrown: Error | undefined;
		try {
			pullKeepingIndex();
		} catch (error) {
			thrown = error as Error;
		}

		const [sha, subject] = sh("git stash list --format='%H %gs'", local)
			.trim()
			.split(" ");
		expect(subject).toBe("autostash");
		expect(thrown?.message).toContain(`(${sha})`);
		expect(thrown?.message).toContain("applied with conflicts in tracked.txt");
		expect(thrown?.message).not.toContain("git stash apply");
		expect(sh(`git show ${sha}:tracked.txt`, local)).toBe("local\n");
	});

	it("keeps unstaged changes out of the index", () => {
		writeFileSync(join(local, "partial.txt"), "a\nb\n");
		sh("git add partial.txt", local);
		writeFileSync(join(local, "partial.txt"), "a\nb\nc\n");
		writeFileSync(join(local, "tracked.txt"), "unstaged\n");

		pullKeepingIndex();

		expect(sh("git show :partial.txt", local)).toBe("a\nb\n");
		expect(sh("git diff --name-only", local)).toBe(
			"partial.txt\ntracked.txt\n",
		);
	});
});
