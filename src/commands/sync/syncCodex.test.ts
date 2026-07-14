import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as HarnessModule from "../../shared/harnesses";

const mockIsHarnessAvailable = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockMkdirSync = vi.fn();
const mockCopyFileSync = vi.fn();

vi.mock("../../shared/harnesses", async (importOriginal) => {
	const actual = await importOriginal<typeof HarnessModule>();
	return {
		...actual,
		isHarnessAvailable: (kind: string) => mockIsHarnessAvailable(kind),
	};
});

vi.mock("node:fs", () => ({
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
	writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
	mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
	copyFileSync: (...args: unknown[]) => mockCopyFileSync(...args),
}));

import { harnesses } from "../../shared/harnesses";
import { commandToSkill, syncCodex } from "./syncCodex";

describe("commandToSkill", () => {
	it("rewrites command frontmatter to a name + description SKILL header", () => {
		const source = [
			"---",
			"description: Refine an existing backlog item through conversation",
			'allowed_args: "<backlog item id>"',
			"---",
			"",
			"You are helping the user refine.",
			"",
		].join("\n");

		const skill = commandToSkill("refine", source);

		expect(skill).toBe(
			[
				"---",
				"name: refine",
				'description: "Refine an existing backlog item through conversation"',
				"---",
				"",
				"You are helping the user refine.",
				"",
			].join("\n"),
		);
	});

	it("falls back to the name when there is no description", () => {
		const skill = commandToSkill("foo", "just a body, no frontmatter");
		expect(skill).toContain("name: foo");
		expect(skill).toContain('description: "foo"');
		expect(skill).toContain("just a body, no frontmatter");
	});

	it("escapes quotes in the description", () => {
		const source = '---\ndescription: say "hi" now\n---\nbody';
		expect(commandToSkill("x", source)).toContain(
			String.raw`description: "say \"hi\" now"`,
		);
	});
});

describe("syncCodex", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsHarnessAvailable.mockReturnValue(true);
		mockReaddirSync.mockReturnValue(["refine.md", "notes.txt"]);
		mockReadFileSync.mockReturnValue("---\ndescription: Refine it\n---\nbody");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("does nothing when codex is not available", () => {
		mockIsHarnessAvailable.mockReturnValue(false);
		syncCodex("/claude");
		expect(mockReaddirSync).not.toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockCopyFileSync).not.toHaveBeenCalled();
	});

	it("writes each command as skills/<name>/SKILL.md, skipping non-md files", () => {
		syncCodex("/claude");

		const skillTarget = path.join(
			harnesses.codex.homeDir,
			"skills",
			"refine",
			"SKILL.md",
		);
		expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			skillTarget,
			expect.stringContaining("name: refine"),
		);
		expect(mockMkdirSync).toHaveBeenCalledWith(path.dirname(skillTarget), {
			recursive: true,
		});
	});

	it("copies CLAUDE.md to ~/.codex/AGENTS.md verbatim", () => {
		syncCodex("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "CLAUDE.md"),
			path.join(harnesses.codex.homeDir, "AGENTS.md"),
		);
	});
});
