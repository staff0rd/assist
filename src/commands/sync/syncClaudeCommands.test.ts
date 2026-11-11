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
import { createSyncFiles } from "./createSyncFiles";
import { syncClaudeCommands } from "./syncClaudeCommands";

const PR = "---\ndescription: Raise a PR\n---\n\nPR BODY\n";
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

	const skillFile = (name: string) =>
		join(targetBase, "skills", name, "SKILL.md");

	it("writes every command as a personal skill", () => {
		syncClaudeCommands(claudeDir, targetBase, createSyncFiles([]));

		expect(readFileSync(skillFile("pr"), "utf8")).toBe(
			'---\nname: pr\ndescription: "Raise a PR"\n---\n\nPR BODY\n',
		);
		expect(readFileSync(skillFile("commit"), "utf8")).toBe(
			'---\nname: commit\ndescription: "Commit"\n---\n\nCOMMIT BODY\n',
		);
	});

	it("returns the synced command names, ignoring non-.md files", () => {
		writeFileSync(join(claudeDir, "commands", "notes.txt"), "x");

		expect(
			syncClaudeCommands(claudeDir, targetBase, createSyncFiles([])).sort(),
		).toEqual(["commit", "pr"]);
	});

	it("removes a command file an earlier sync copied verbatim", () => {
		mkdirSync(join(targetBase, "commands"));
		writeFileSync(join(targetBase, "commands", "pr.md"), PR);
		writeFileSync(join(targetBase, "commands", "mine.md"), "MINE");

		syncClaudeCommands(claudeDir, targetBase, createSyncFiles([]));

		expect(existsSync(join(targetBase, "commands", "pr.md"))).toBe(false);
		expect(existsSync(join(targetBase, "commands", "mine.md"))).toBe(true);
	});

	it("leaves a user-authored same-named skill and command until confirmed", async () => {
		mkdirSync(join(targetBase, "skills", "commit"), { recursive: true });
		writeFileSync(skillFile("commit"), "MY COMMIT SKILL");
		mkdirSync(join(targetBase, "commands"));
		writeFileSync(join(targetBase, "commands", "pr.md"), "MY PR COMMAND");
		const files = createSyncFiles([]);

		syncClaudeCommands(claudeDir, targetBase, files);
		await files.finish(true);

		expect(readFileSync(skillFile("commit"), "utf8")).toBe("MY COMMIT SKILL");
		expect(readFileSync(join(targetBase, "commands", "pr.md"), "utf8")).toBe(
			"MY PR COMMAND",
		);
		expect(readFileSync(skillFile("pr"), "utf8")).toContain("PR BODY");
		expect(files.owns(skillFile("commit"))).toBe(false);
		expect(files.owns(skillFile("pr"))).toBe(true);
	});

	it("overwrites a skill a previous sync recorded as written", () => {
		mkdirSync(join(targetBase, "skills", "commit"), { recursive: true });
		writeFileSync(skillFile("commit"), "OLD ASSIST VERSION");

		syncClaudeCommands(
			claudeDir,
			targetBase,
			createSyncFiles([skillFile("commit")]),
		);

		expect(readFileSync(skillFile("commit"), "utf8")).toContain("COMMIT BODY");
	});

	it("replaces an owned symlinked SKILL.md without touching its target", () => {
		const linkTarget = join(targetBase, "elsewhere.md");
		writeFileSync(linkTarget, "ORIGINAL");
		mkdirSync(join(targetBase, "skills", "pr"), { recursive: true });
		symlinkSync(linkTarget, skillFile("pr"));

		syncClaudeCommands(
			claudeDir,
			targetBase,
			createSyncFiles([skillFile("pr")]),
		);

		expect(lstatSync(skillFile("pr")).isSymbolicLink()).toBe(false);
		expect(readFileSync(skillFile("pr"), "utf8")).toContain("name: pr");
		expect(readFileSync(linkTarget, "utf8")).toBe("ORIGINAL");
	});
});
