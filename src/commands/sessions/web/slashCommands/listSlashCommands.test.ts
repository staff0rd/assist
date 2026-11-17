import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listSlashCommands } from "./listSlashCommands";
import type { SlashCommandSources } from "../../../../shared/harnesses";

let root: string;
let home: SlashCommandSources;
let cwd: string;

function write(relative: string, content = "") {
	const file = path.join(root, relative);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), "list-slash-commands-"));
	home = {
		userHomes: [path.join(root, "home/.claude")],
		projectDirs: [".claude"],
	};
	cwd = path.join(root, "repo");
});

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true });
});

describe("listSlashCommands", () => {
	it("lists user entries then project entries from the cwd's .claude", () => {
		write("home/.claude/commands/zeta.md");
		write("repo/.claude/skills/alpha/SKILL.md", "---\ndescription: A\n---\n");
		write("repo/.claude/commands/beta.md");
		expect(listSlashCommands(home, cwd)).toEqual([
			{ name: "zeta", description: undefined, scope: "user" },
			{ name: "alpha", description: "A", scope: "project" },
			{ name: "beta", description: undefined, scope: "project" },
		]);
	});

	it("keeps the user entry when a project entry has the same name", () => {
		write("home/.claude/skills/verify/SKILL.md", "---\ndescription: U\n---\n");
		write("repo/.claude/commands/verify.md", "---\ndescription: P\n---\n");
		expect(listSlashCommands(home, cwd)).toEqual([
			{ name: "verify", description: "U", scope: "user" },
		]);
	});

	it("lists only user entries when the cwd has no .claude folder", () => {
		write("home/.claude/commands/draft.md");
		expect(listSlashCommands(home, cwd)).toEqual([
			{ name: "draft", description: undefined, scope: "user" },
		]);
	});
});

describe("listSlashCommands with given project commands", () => {
	it("uses them instead of the cwd's working tree", () => {
		write("repo/.claude/commands/stale.md");
		write("home/.claude/commands/helm.md");
		expect(
			listSlashCommands(home, cwd, [
				{ name: "helm", scope: "project" },
				{ name: "fresh", description: "F", scope: "project" },
			]),
		).toEqual([
			{ name: "helm", description: undefined, scope: "user" },
			{ name: "fresh", description: "F", scope: "project" },
		]);
	});
});

describe("listSlashCommands with Codex sources", () => {
	const codex = () => ({
		userHomes: [
			path.join(root, "home/.codex"),
			path.join(root, "home/.agents"),
		],
		projectDirs: [".agents", ".codex"],
	});

	it("merges every user home and project dir, first source winning", () => {
		write("home/.codex/skills/commit/SKILL.md", "---\ndescription: C\n---\n");
		write("home/.agents/skills/commit/SKILL.md", "---\ndescription: A\n---\n");
		write("home/.agents/skills/bug/SKILL.md");
		write("repo/.agents/skills/deploy/SKILL.md");
		write("repo/.codex/skills/cook/SKILL.md");
		write("repo/.claude/skills/claude-only/SKILL.md");
		expect(listSlashCommands(codex(), cwd)).toEqual([
			{ name: "bug", description: undefined, scope: "user" },
			{ name: "commit", description: "C", scope: "user" },
			{ name: "cook", description: undefined, scope: "project" },
			{ name: "deploy", description: undefined, scope: "project" },
		]);
	});
});
