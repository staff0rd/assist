import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listCloneBaseRepos } from "./listCloneBaseRepos";

describe("listCloneBaseRepos", () => {
	let baseDir: string;

	beforeEach(() => {
		baseDir = mkdtempSync(join(tmpdir(), "clone-base-repos-"));
	});

	afterEach(() => {
		rmSync(baseDir, { recursive: true, force: true });
	});

	it("lists main clones by name and cwd, sorted, skipping worktrees and non-repos", () => {
		mkdirSync(join(baseDir, "zeta", ".git"), { recursive: true });
		mkdirSync(join(baseDir, "assist", ".git"), { recursive: true });
		mkdirSync(join(baseDir, "assist-3"));
		writeFileSync(join(baseDir, "assist-3", ".git"), "gitdir: elsewhere");
		mkdirSync(join(baseDir, "notes"));
		writeFileSync(join(baseDir, "loose.txt"), "");

		expect(listCloneBaseRepos(baseDir)).toEqual([
			{ name: "assist", cwd: join(baseDir, "assist") },
			{ name: "zeta", cwd: join(baseDir, "zeta") },
		]);
	});

	it("returns no repos when the base dir is missing", () => {
		expect(listCloneBaseRepos(join(baseDir, "missing"))).toEqual([]);
	});
});
