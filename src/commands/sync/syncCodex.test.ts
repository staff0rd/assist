import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as HarnessModule from "../../shared/harnesses";

const mockIsHarnessAvailable = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockMkdirSync = vi.fn();
const mockCopyFileSync = vi.fn();
const mockExistsSync = vi.fn();

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
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
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
		mockReadFileSync.mockImplementation((target: string) =>
			target.endsWith(path.join("codex", "config.toml"))
				? '[[hooks.PreToolUse]]\nmatcher = "Bash"\n[[hooks.PreToolUse.hooks]]\ntype = "command"\ncommand = "assist codex-hook"\n\n[[hooks.PermissionRequest]]\n[[hooks.PermissionRequest.hooks]]\ntype = "command"\ncommand = "assist codex-hook"'
				: "---\ndescription: Refine it\n---\nbody",
		);
		mockExistsSync.mockReturnValue(false);
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
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			skillTarget,
			expect.stringContaining("name: refine"),
		);
		expect(mockMkdirSync).toHaveBeenCalledWith(path.dirname(skillTarget), {
			recursive: true,
		});
	});

	it("registers the codex-hook adapter in ~/.codex/config.toml", () => {
		syncCodex("/claude");

		const configTarget = path.join(harnesses.codex.homeDir, "config.toml");
		const write = mockWriteFileSync.mock.calls.find(
			([target]) => target === configTarget,
		);
		expect(write).toBeDefined();
		const contents = write?.[1] as string;
		expect(contents).toContain("[[hooks.PreToolUse]]");
		expect(contents).toContain('matcher = "Bash"');
		expect(contents).toContain("[[hooks.PermissionRequest]]");
		expect(contents).toContain('command = "assist codex-hook"');
	});

	it("copies CLAUDE.md to ~/.codex/AGENTS.md verbatim", () => {
		syncCodex("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "CLAUDE.md"),
			path.join(harnesses.codex.homeDir, "AGENTS.md"),
		);
	});
});
