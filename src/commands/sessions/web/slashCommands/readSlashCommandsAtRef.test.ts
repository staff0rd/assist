import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readSlashCommandsAtRef } from "./readSlashCommandsAtRef";

let repo: string;

function git(...args: string[]) {
	execFileSync("git", args, { cwd: repo, stdio: "pipe" });
}

function write(relative: string, content = "") {
	const file = path.join(repo, relative);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

function commitAll(message: string) {
	git("add", "-A");
	git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", message);
}

beforeEach(() => {
	repo = fs.mkdtempSync(path.join(os.tmpdir(), "slash-ref-"));
	git("init", "-q", "-b", "main");
	write("README.md", "x");
	commitAll("initial");
	git("branch", "base");
});

afterEach(() => {
	fs.rmSync(repo, { recursive: true, force: true });
});

describe("readSlashCommandsAtRef", () => {
	it("lists the ref's commands and skills with frontmatter descriptions", async () => {
		write(".claude/skills/helm/SKILL.md", "---\ndescription: Steer\n---\n");
		write(".claude/commands/deploy.md", "---\ndescription: Ship\n---\n");
		write(".claude/commands/nested/inner.md", "x");
		write(".claude/skills/empty/notes.md", "x");
		commitAll("add skills");
		git("checkout", "-q", "base");
		expect(await readSlashCommandsAtRef(repo, "main", "project")).toEqual([
			{ name: "deploy", description: "Ship", scope: "project" },
			{ name: "helm", description: "Steer", scope: "project" },
		]);
	});

	it("lists from the repo root when given a subdirectory", async () => {
		write(".claude/commands/deploy.md");
		write("sub/file.txt", "x");
		commitAll("add command");
		expect(
			await readSlashCommandsAtRef(path.join(repo, "sub"), "main", "project"),
		).toEqual([{ name: "deploy", description: undefined, scope: "project" }]);
	});

	it("lists a name once when it is both a skill and a command", async () => {
		write(".claude/skills/verify/SKILL.md", "---\ndescription: Skill\n---\n");
		write(".claude/commands/verify.md", "---\ndescription: Command\n---\n");
		commitAll("add both");
		expect(await readSlashCommandsAtRef(repo, "main", "project")).toEqual([
			{ name: "verify", description: "Skill", scope: "project" },
		]);
	});

	it("returns an empty list when the ref has no .claude folder", async () => {
		expect(await readSlashCommandsAtRef(repo, "base", "project")).toEqual([]);
	});

	it("returns null when the ref does not resolve", async () => {
		expect(
			await readSlashCommandsAtRef(repo, "origin/main", "project"),
		).toBeNull();
	});
});
