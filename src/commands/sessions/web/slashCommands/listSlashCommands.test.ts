import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listSlashCommands } from "./listSlashCommands";

let root: string;
let home: string;
let cwd: string;

function write(relative: string, content = "") {
	const file = path.join(root, relative);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), "list-slash-commands-"));
	home = path.join(root, "home/.claude");
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
