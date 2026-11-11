import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readSlashCommands } from "./readSlashCommands";

let home: string;

function write(relative: string, content: string) {
	const file = path.join(home, relative);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

beforeEach(() => {
	home = fs.mkdtempSync(path.join(os.tmpdir(), "slash-commands-"));
});

afterEach(() => {
	fs.rmSync(home, { recursive: true, force: true });
});

describe("readSlashCommands", () => {
	it("lists skills and commands with their frontmatter descriptions, sorted by name", () => {
		write(
			"skills/draft/SKILL.md",
			"---\ndescription: Draft an item\n---\nbody",
		);
		write("commands/commit.md", '---\ndescription: "Commit files"\n---\n');
		write("commands/bare.md", "no frontmatter");
		expect(readSlashCommands(home, "user")).toEqual([
			{ name: "bare", description: undefined, scope: "user" },
			{ name: "commit", description: "Commit files", scope: "user" },
			{ name: "draft", description: "Draft an item", scope: "user" },
		]);
	});

	it("skips skill folders without SKILL.md and loose files in skills", () => {
		write("skills/empty/notes.md", "x");
		write("skills/loose.md", "---\ndescription: x\n---\n");
		write("commands/nested/inner.md", "x");
		expect(readSlashCommands(home, "user")).toEqual([]);
	});

	it("lists a name once when it is both a skill and a command", () => {
		write("skills/verify/SKILL.md", "---\ndescription: Skill\n---\n");
		write("commands/verify.md", "---\ndescription: Command\n---\n");
		expect(readSlashCommands(home, "project")).toEqual([
			{ name: "verify", description: "Skill", scope: "project" },
		]);
	});

	it("returns nothing when the home dir is missing", () => {
		expect(readSlashCommands(path.join(home, "absent"), "user")).toEqual([]);
	});
});
