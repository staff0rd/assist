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
import { commandToPrompt, syncPi } from "./syncPi";

describe("commandToPrompt", () => {
	it("keeps the description and maps allowed_args to argument-hint", () => {
		const source = [
			"---",
			"description: Refine an existing backlog item through conversation",
			'allowed_args: "<backlog item id>"',
			"---",
			"",
			"You are helping the user refine.",
			"",
		].join("\n");

		expect(commandToPrompt("refine", source)).toBe(
			[
				"---",
				"description: Refine an existing backlog item through conversation",
				"argument-hint: <backlog item id>",
				"---",
				"",
				"You are helping the user refine.",
				"",
			].join("\n"),
		);
	});

	it("omits argument-hint when there is no allowed_args", () => {
		const source = "---\ndescription: Do a thing\n---\nbody";
		const prompt = commandToPrompt("thing", source);
		expect(prompt).toContain("description: Do a thing");
		expect(prompt).not.toContain("argument-hint");
		expect(prompt).toContain("body");
	});

	it("falls back to the name when there is no description", () => {
		const prompt = commandToPrompt("foo", "just a body, no frontmatter");
		expect(prompt).toContain("description: foo");
		expect(prompt).toContain("just a body, no frontmatter");
	});

	it("preserves $ARGUMENTS placeholders in the body", () => {
		const source = "---\ndescription: d\n---\nrun with $ARGUMENTS and $1";
		expect(commandToPrompt("x", source)).toContain(
			"run with $ARGUMENTS and $1",
		);
	});
});

describe("syncPi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsHarnessAvailable.mockReturnValue(true);
		mockReaddirSync.mockReturnValue(["refine.md", "notes.txt"]);
		mockReadFileSync.mockReturnValue("---\ndescription: Refine it\n---\nbody");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("does nothing when pi is not available", () => {
		mockIsHarnessAvailable.mockReturnValue(false);
		syncPi("/claude");
		expect(mockReaddirSync).not.toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockCopyFileSync).not.toHaveBeenCalled();
	});

	it("writes each command as prompts/<name>.md, skipping non-md files", () => {
		syncPi("/claude");

		const promptTarget = path.join(
			harnesses.pi.homeDir,
			"prompts",
			"refine.md",
		);
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			promptTarget,
			expect.stringContaining("description: Refine it"),
		);
		expect(mockMkdirSync).toHaveBeenCalledWith(path.dirname(promptTarget), {
			recursive: true,
		});
		const wrote = mockWriteFileSync.mock.calls.filter(([target]) =>
			(target as string).endsWith(".md"),
		);
		expect(wrote).toHaveLength(1);
	});

	it("copies CLAUDE.md to ~/.pi/agent/AGENTS.md verbatim", () => {
		syncPi("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "CLAUDE.md"),
			path.join(harnesses.pi.homeDir, "AGENTS.md"),
		);
	});

	it("installs the permission-gate extension from the pi source dir", () => {
		syncPi("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "..", "pi", "permission-gate.ts"),
			path.join(
				harnesses.pi.homeDir,
				"extensions",
				"assist-permission-gate.ts",
			),
		);
	});
});
