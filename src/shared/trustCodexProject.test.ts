import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ codexHome: "" }));

vi.mock("./harnesses", () => ({
	harnesses: {
		get codex() {
			return { homeDir: env.codexHome };
		},
	},
}));

import { trustCodexProject } from "./trustCodexProject";

let dir: string;

function git(cwd: string, ...args: string[]) {
	execFileSync("git", args, { cwd, stdio: "ignore" });
}

function config() {
	return fs.readFileSync(path.join(env.codexHome, "config.toml"), "utf8");
}

beforeEach(() => {
	dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "trust-")));
	env.codexHome = path.join(dir, "codex");
	git(dir, "init", "-q", "repo");
});

afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("trustCodexProject", () => {
	it("trusts a worktree's clone root, since Codex applies trust there", () => {
		const repo = path.join(dir, "repo");
		git(
			repo,
			"-c",
			"user.name=t",
			"-c",
			"user.email=t@t",
			"commit",
			"-q",
			"--allow-empty",
			"-m",
			"init",
		);
		git(repo, "worktree", "add", "-q", "../repo-2");
		expect(trustCodexProject(path.join(dir, "repo-2"))).toBe(repo);
		expect(config()).toBe(
			`[projects.${JSON.stringify(repo)}]\ntrust_level = "trusted"\n`,
		);
	});

	it("keeps an existing entry for the root and the rest of the config", () => {
		const repo = path.join(dir, "repo");
		fs.mkdirSync(env.codexHome);
		const existing = `model = "x"\n\n[projects.${JSON.stringify(repo)}]\ntrust_level = "untrusted"\n`;
		fs.writeFileSync(path.join(env.codexHome, "config.toml"), existing);
		expect(trustCodexProject(repo)).toBeUndefined();
		expect(config()).toBe(existing);
	});

	it("appends after existing settings", () => {
		const repo = path.join(dir, "repo");
		fs.mkdirSync(env.codexHome);
		fs.writeFileSync(path.join(env.codexHome, "config.toml"), 'model = "x"\n');
		trustCodexProject(repo);
		expect(config()).toBe(
			`model = "x"\n\n[projects.${JSON.stringify(repo)}]\ntrust_level = "trusted"\n`,
		);
	});

	it("does nothing outside a git repo", () => {
		trustCodexProject(dir);
		expect(fs.existsSync(path.join(env.codexHome, "config.toml"))).toBe(false);
	});
});
