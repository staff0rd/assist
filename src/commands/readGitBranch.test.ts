import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readGitBranch } from "./readGitBranch";

describe("readGitBranch", () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "read-git-branch-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	function writeHead(contents: string): void {
		mkdirSync(join(dir, ".git"), { recursive: true });
		writeFileSync(join(dir, ".git", "HEAD"), contents);
	}

	it("returns the branch name for a named branch", () => {
		writeHead("ref: refs/heads/main\n");
		expect(readGitBranch(dir)).toBe("main");
	});

	it("returns branch names containing slashes", () => {
		writeHead("ref: refs/heads/feature/some-thing\n");
		expect(readGitBranch(dir)).toBe("feature/some-thing");
	});

	it("returns null for a detached HEAD (raw SHA)", () => {
		writeHead("9f8e7d6c5b4a39281706f5e4d3c2b1a0f9e8d7c6\n");
		expect(readGitBranch(dir)).toBeNull();
	});

	it("returns null when the directory is not a repo", () => {
		expect(readGitBranch(dir)).toBeNull();
	});

	it("resolves the branch when .git is a file pointing elsewhere", () => {
		const gitDir = join(dir, "actual-git-dir");
		mkdirSync(gitDir, { recursive: true });
		writeFileSync(join(gitDir, "HEAD"), "ref: refs/heads/worktree-branch\n");

		const worktree = join(dir, "worktree");
		mkdirSync(worktree, { recursive: true });
		writeFileSync(join(worktree, ".git"), `gitdir: ${gitDir}\n`);

		expect(readGitBranch(worktree)).toBe("worktree-branch");
	});

	it("resolves a relative gitdir pointer", () => {
		const gitDir = join(dir, "actual-git-dir");
		mkdirSync(gitDir, { recursive: true });
		writeFileSync(join(gitDir, "HEAD"), "ref: refs/heads/rel-branch\n");

		const worktree = join(dir, "worktree");
		mkdirSync(worktree, { recursive: true });
		writeFileSync(join(worktree, ".git"), "gitdir: ../actual-git-dir\n");

		expect(readGitBranch(worktree)).toBe("rel-branch");
	});
});
