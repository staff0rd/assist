import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { checkDurabilitySync } from "../../sessions/daemon/worktree/treeDurability";
import { discardCancelledPhase } from "./discardCancelledPhase";

function git(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd: string, file: string): void {
	writeFileSync(join(cwd, file), file);
	git(cwd, "add", file);
	git(cwd, "commit", "-qm", file);
}

describe("discardCancelledPhase", () => {
	let root: string;
	let itemTree: string;
	let phaseTree: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "discard-phase-"));
		const remote = join(root, "remote.git");
		itemTree = join(root, "item");
		phaseTree = join(root, "phase");
		execFileSync("git", ["init", "-q", "--bare", "-b", "main", remote]);
		execFileSync("git", ["clone", "-q", remote, itemTree]);
		git(itemTree, "config", "user.email", "t@example.com");
		git(itemTree, "config", "user.name", "t");
		commit(itemTree, "base.txt");
		git(itemTree, "push", "-q", "-u", "origin", "HEAD:main");
		git(itemTree, "worktree", "add", "-q", "-b", "phase", phaseTree);
		git(phaseTree, "branch", "--set-upstream-to", "origin/main");
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	it("drops unpushed commits and stray files so the worktree reaps", () => {
		commit(phaseTree, "phase.txt");
		writeFileSync(join(phaseTree, "stray.txt"), "x");
		expect(checkDurabilitySync(phaseTree).durable).toBe(false);

		discardCancelledPhase(itemTree, "test", phaseTree);

		expect(existsSync(join(phaseTree, "phase.txt"))).toBe(false);
		expect(existsSync(join(phaseTree, "stray.txt"))).toBe(false);
		expect(checkDurabilitySync(phaseTree).durable).toBe(true);
	});
});
