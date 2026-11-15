import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { landPhase } from "./landPhase";
import { unlandedPhaseError } from "./unlandedPhaseError";

function git(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd: string, file: string, text: string): void {
	writeFileSync(join(cwd, file), text);
	git(cwd, "add", file);
	git(cwd, "commit", "-qm", file);
}

describe("landPhase", () => {
	let root: string;
	let itemTree: string;
	let phaseTree: string;
	const cwd = process.cwd();

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "land-phase-"));
		itemTree = join(root, "item");
		phaseTree = join(root, "phase");
		execFileSync("git", ["init", "-q", "-b", "item", itemTree]);
		git(itemTree, "config", "user.email", "t@example.com");
		git(itemTree, "config", "user.name", "t");
		commit(itemTree, "base.txt", "base");
		git(itemTree, "worktree", "add", "-q", "-b", "phase", phaseTree);
		process.chdir(phaseTree);
		process.env.ASSIST_PHASE_LAND_TREE = itemTree;
		process.env.ASSIST_BACKLOG_PHASE = "2";
		process.exitCode = undefined;
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		process.chdir(cwd);
		rmSync(root, { recursive: true, force: true });
		delete process.env.ASSIST_PHASE_LAND_TREE;
		delete process.env.ASSIST_BACKLOG_PHASE;
		process.exitCode = undefined;
		vi.restoreAllMocks();
	});

	it("fast-forwards the item branch onto the phase's commits", () => {
		commit(phaseTree, "phase.txt", "phase");
		expect(unlandedPhaseError(2)).toContain("not landed");

		landPhase();

		expect(process.exitCode).toBeUndefined();
		expect(git(itemTree, "rev-parse", "HEAD")).toBe(
			git(phaseTree, "rev-parse", "HEAD"),
		);
		expect(unlandedPhaseError(2)).toBeUndefined();
	});

	it("refuses to land uncommitted work", () => {
		writeFileSync(join(phaseTree, "dirty.txt"), "x");

		landPhase();

		expect(process.exitCode).toBe(1);
	});

	it("stops on a conflicting rebase for the agent to resolve", () => {
		commit(phaseTree, "base.txt", "phase");
		commit(itemTree, "base.txt", "other phase");

		landPhase();

		expect(process.exitCode).toBe(1);
		git(phaseTree, "rebase", "--abort");
	});

	it("only gates the phase this session runs", () => {
		commit(phaseTree, "phase.txt", "phase");

		expect(unlandedPhaseError(3)).toBeUndefined();
	});
});
