import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listNoteRepos } from "./listNoteRepos";

describe("listNoteRepos", () => {
	let baseDir: string;

	beforeEach(() => {
		baseDir = mkdtempSync(join(tmpdir(), "note-repos-"));
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

		expect(listNoteRepos(baseDir)).toEqual([
			{ name: "assist", cwd: join(baseDir, "assist") },
			{ name: "zeta", cwd: join(baseDir, "zeta") },
		]);
	});

	it("returns no repos when the base dir is missing", () => {
		expect(listNoteRepos(join(baseDir, "missing"))).toEqual([]);
	});
});
