import {
	existsSync,
	mkdirSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gitSync } from "./git";
import { listLocalBranches, listWorktreePaths } from "./listWorktreePaths";
import { removeTree } from "./removeTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

let root: string;
let clone: string;
let tree: string;

function commitSomething(): void {
	writeFileSync(join(clone, "README.md"), "hello\n");
	gitSync(clone, ["add", "README.md"]);
	gitSync(clone, [
		"-c",
		"commit.gpgsign=false",
		"-c",
		"core.hooksPath=",
		"commit",
		"-m",
		"init",
	]);
}

beforeEach(() => {
	root = join(
		realpathSync(tmpdir()),
		`assist-removetree-${process.pid}-${performance.now()}`,
	);
	clone = join(root, "repo");
	tree = join(root, "repo-2");
	mkdirSync(clone, { recursive: true });
	gitSync(clone, ["init", "-b", "main"]);
	gitSync(clone, ["config", "user.email", "test@example.com"]);
	gitSync(clone, ["config", "user.name", "test"]);
	commitSomething();
	gitSync(clone, ["worktree", "add", "-b", "repo-2", tree, "main"]);
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe("removeTree against real git", () => {
	it("removes a clean tree the ordinary way", async () => {
		expect(await removeTree(clone, tree, false)).toEqual({ removed: true });

		expect(existsSync(tree)).toBe(false);
		expect(listWorktreePaths(clone)).not.toContain(tree);
	});

	it("deletes a tree git has abandoned, leaving no directory and no bookkeeping", async () => {
		mkdirSync(join(tree, "node_modules", "pkg"), { recursive: true });
		writeFileSync(join(tree, "node_modules", "pkg", "index.js"), "//\n");
		rmSync(join(tree, ".git"));

		expect(await removeTree(clone, tree, false)).toEqual({ removed: true });

		expect(existsSync(tree)).toBe(false);
		expect(listWorktreePaths(clone)).not.toContain(tree);
		expect(gitSync(clone, ["branch", "-D", "repo-2"])).toContain("Deleted");
		expect(listLocalBranches(clone)).not.toContain("repo-2");
	});

	it("discards a tree git has unregistered but left on disk", async () => {
		mkdirSync(join(tree, "node_modules", "pkg"), { recursive: true });
		writeFileSync(join(tree, "node_modules", "pkg", "index.js"), "//\n");
		rmSync(join(clone, ".git", "worktrees", "repo-2"), {
			recursive: true,
			force: true,
		});

		expect(await removeTree(clone, tree, true)).toEqual({ removed: true });

		expect(existsSync(tree)).toBe(false);
		expect(listWorktreePaths(clone)).not.toContain(tree);
	});

	it("leaves a tree in place when an ordinary close hits a git failure that is not fatal to it", async () => {
		gitSync(clone, ["worktree", "lock", tree]);

		expect(await removeTree(clone, tree, false)).toMatchObject({
			removed: false,
			reason: expect.stringContaining("locked"),
		});

		expect(existsSync(tree)).toBe(true);
		expect(listWorktreePaths(clone)).toContain(tree);
	});

	it("deletes a discarded tree even when git refuses for a reason of its own", async () => {
		gitSync(clone, ["worktree", "lock", tree]);

		expect(await removeTree(clone, tree, true)).toEqual({ removed: true });

		expect(existsSync(tree)).toBe(false);
	});

	it("never deletes a path that is a clone in its own right", async () => {
		expect(await removeTree(clone, clone, true)).toMatchObject({
			removed: false,
			reason: expect.stringContaining("clone of its own"),
		});

		expect(existsSync(clone)).toBe(true);
	});
});
