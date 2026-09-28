import {
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncClaudeCommands } from "./syncClaudeCommands";

const PR = "---\ndescription: Raise a PR\nskill: true\n---\n\nPR BODY\n";
const COMMIT = "---\ndescription: Commit\n---\n\nCOMMIT BODY\n";

describe("syncClaudeCommands", () => {
	let claudeDir: string;
	let targetBase: string;

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		claudeDir = mkdtempSync(join(tmpdir(), "assist-cmd-source-"));
		targetBase = mkdtempSync(join(tmpdir(), "assist-cmd-target-"));
		mkdirSync(join(claudeDir, "commands"));
		writeFileSync(join(claudeDir, "commands", "pr.md"), PR);
		writeFileSync(join(claudeDir, "commands", "commit.md"), COMMIT);
	});

	afterEach(() => {
		rmSync(claudeDir, { recursive: true, force: true });
		rmSync(targetBase, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	const skillFile = () => join(targetBase, "skills", "pr", "SKILL.md");

	it("writes a skill-flagged command as a personal skill", () => {
		syncClaudeCommands(claudeDir, targetBase);

		expect(readFileSync(skillFile(), "utf8")).toBe(
			'---\nname: pr\ndescription: "Raise a PR"\n---\n\nPR BODY\n',
		);
		expect(existsSync(join(targetBase, "commands", "pr.md"))).toBe(false);
	});

	it("removes a previously synced command file for a skill-flagged command", () => {
		mkdirSync(join(targetBase, "commands"));
		writeFileSync(join(targetBase, "commands", "pr.md"), "OLD");

		syncClaudeCommands(claudeDir, targetBase);

		expect(existsSync(join(targetBase, "commands", "pr.md"))).toBe(false);
	});

	it("replaces a symlinked SKILL.md without touching its target", () => {
		const linkTarget = join(targetBase, "elsewhere.md");
		writeFileSync(linkTarget, "ORIGINAL");
		mkdirSync(join(targetBase, "skills", "pr"), { recursive: true });
		symlinkSync(linkTarget, skillFile());

		syncClaudeCommands(claudeDir, targetBase);

		expect(lstatSync(skillFile()).isSymbolicLink()).toBe(false);
		expect(readFileSync(skillFile(), "utf8")).toContain("name: pr");
		expect(readFileSync(linkTarget, "utf8")).toBe("ORIGINAL");
	});

	it("copies unflagged commands to the commands directory unchanged", () => {
		syncClaudeCommands(claudeDir, targetBase);

		expect(
			readFileSync(join(targetBase, "commands", "commit.md"), "utf8"),
		).toBe(COMMIT);
		expect(existsSync(join(targetBase, "skills", "commit"))).toBe(false);
	});

	it("ignores skill: true outside the frontmatter", () => {
		writeFileSync(
			join(claudeDir, "commands", "pr.md"),
			"---\ndescription: Raise a PR\n---\n\nskill: true\n",
		);

		syncClaudeCommands(claudeDir, targetBase);

		expect(existsSync(join(targetBase, "commands", "pr.md"))).toBe(true);
		expect(existsSync(skillFile())).toBe(false);
	});
});
