import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadProjectConfig, saveConfig } from "./loadConfig";
import { loadConfigFrom, projectConfigPathFrom } from "./loadConfigFrom";

let base: string;
let clone: string;
let worktree: string;

function writeConfig(root: string, body: string): string {
	const path = join(root, "assist.yml");
	writeFileSync(path, body);
	return path;
}

beforeEach(() => {
	base = mkdtempSync(join(tmpdir(), "project-config-"));
	clone = join(base, "repo");
	const gitDir = join(clone, ".git", "worktrees", "repo-2");
	mkdirSync(gitDir, { recursive: true });
	writeFileSync(join(gitDir, "commondir"), "../..\n");
	worktree = join(base, "repo-2");
	mkdirSync(worktree, { recursive: true });
	writeFileSync(join(worktree, ".git"), `gitdir: ${gitDir}\n`);
});

afterEach(() => {
	rmSync(base, { recursive: true, force: true });
});

describe("projectConfigPathFrom", () => {
	it("uses the clone's config when the worktree has none", () => {
		const cloneConfig = writeConfig(clone, "prs:\n  required: true\n");

		expect(projectConfigPathFrom(worktree)).toBe(cloneConfig);
	});

	it("prefers the worktree's own config when it has one", () => {
		writeConfig(clone, "prs:\n  required: true\n");
		const own = writeConfig(worktree, "prs:\n  required: false\n");

		expect(projectConfigPathFrom(worktree)).toBe(own);
	});

	it("leaves a plain directory resolving to its own config path", () => {
		const loose = join(base, "loose");
		mkdirSync(loose, { recursive: true });

		expect(projectConfigPathFrom(loose)).toBe(join(loose, "assist.yml"));
	});
});

describe("project config reads and writes from a worktree", () => {
	it("reads the clone's config the worktree inherits", () => {
		writeConfig(clone, "prs:\n  required: true\n");

		expect(loadProjectConfig(worktree)).toEqual({ prs: { required: true } });
	});

	it("edits the inherited config in place rather than shadowing it", () => {
		writeConfig(clone, "prs:\n  required: true\n");

		const config = loadProjectConfig(worktree);
		saveConfig({ ...config, commit: { push: true } }, worktree);

		expect(existsSync(join(worktree, "assist.yml"))).toBe(false);
		expect(loadProjectConfig(clone)).toEqual({
			prs: { required: true },
			commit: { push: true },
		});
	});
});

describe("loadConfigFrom news config", () => {
	const missingGlobal = () => join(base, "no-global.yml");

	it("leaves news.showInNav unset by default", () => {
		writeConfig(clone, "prs:\n  required: true\n");

		expect(loadConfigFrom(clone, missingGlobal()).news).toBeUndefined();
	});

	it("loads news.showInNav", () => {
		writeConfig(clone, "news:\n  showInNav: true\n");

		expect(loadConfigFrom(clone, missingGlobal()).news).toEqual({
			showInNav: true,
		});
	});

	it("drops a legacy news.feeds value and keeps news.showInNav", () => {
		writeConfig(
			clone,
			"news:\n  feeds:\n    - https://example.com/feed\n  showInNav: true\n",
		);

		expect(loadConfigFrom(clone, missingGlobal()).news).toEqual({
			showInNav: true,
		});
	});

	it("defaults news.showInNav to false when only legacy feeds remain", () => {
		writeConfig(clone, "news:\n  feeds:\n    - https://example.com/feed\n");

		expect(loadConfigFrom(clone, missingGlobal()).news).toEqual({
			showInNav: false,
		});
	});
});
