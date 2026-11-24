import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { governedCommandFile } from "./governedCommandFile";

let root: string;

function touch(rel: string): void {
	const file = join(root, rel);
	mkdirSync(join(file, ".."), { recursive: true });
	writeFileSync(file, "");
}

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "governed-"));
	mkdirSync(join(root, ".git"));
	touch(".claude/commands/milestone.md");
	touch(".claude/commands/ios/build.md");
	touch(".claude/skills/deploy/SKILL.md");
	touch("agent/commands/add-rule.md");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("governedCommandFile", () => {
	it.each([
		[
			"In /milestone, wait for approval before making changes",
			".claude/commands/milestone.md",
		],
		["/milestone: wait for approval", ".claude/commands/milestone.md"],
		[
			"When running `/ios:build`, deploy to the simulator",
			".claude/commands/ios/build.md",
		],
		["During /deploy, confirm the target", ".claude/skills/deploy/SKILL.md"],
		["In /add-rule, scope to the command", "agent/commands/add-rule.md"],
	])("finds the command file a rule is scoped to: %s", (text, file) => {
		expect(governedCommandFile(text, root)).toBe(file);
	});

	it.each([
		"Run /milestone after every release",
		"Wait for approval before making changes",
		"In /unknown, wait for approval",
	])("ignores a rule not scoped to a repo command: %s", (text) => {
		expect(governedCommandFile(text, root)).toBeUndefined();
	});

	it("resolves from a subdirectory of the repo", () => {
		mkdirSync(join(root, "work", "milestones"), { recursive: true });
		expect(
			governedCommandFile(
				"In /milestone, wait for approval",
				join(root, "work", "milestones"),
			),
		).toBe(join("..", "..", ".claude", "commands", "milestone.md"));
	});
});
