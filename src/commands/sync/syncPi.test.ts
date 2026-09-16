import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as HarnessModule from "../../shared/harnesses";

const mockIsHarnessAvailable = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockMkdirSync = vi.fn();
const mockCopyFileSync = vi.fn();
const mockPruneCommands = vi.fn();

vi.mock("./pruneCommands", () => ({
	pruneCommands: (...args: unknown[]) => mockPruneCommands(...args),
}));

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
		mockReaddirSync.mockImplementation((dir: string) =>
			dir.endsWith("commands")
				? ["refine.md", "notes.txt"]
				: ["advice.ts", "permission-gate.ts", "status-driver.ts"],
		);
		mockReadFileSync.mockReturnValue("---\ndescription: Refine it\n---\nbody");
		mockPruneCommands.mockReturnValue({
			orphans: [],
			removed: [],
			skipped: [],
			unmanaged: [],
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("does nothing when pi is not available", () => {
		mockIsHarnessAvailable.mockReturnValue(false);
		syncPi("/claude", { prune: true, force: true });
		expect(mockReaddirSync).not.toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockCopyFileSync).not.toHaveBeenCalled();
		expect(mockPruneCommands).not.toHaveBeenCalled();
	});

	it("does not prune without --prune", () => {
		syncPi("/claude");

		expect(mockPruneCommands).not.toHaveBeenCalled();
	});

	it("prunes ~/.pi/agent/prompts against the synced command names", () => {
		syncPi("/claude", { prune: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			path.join(harnesses.pi.homeDir, "prompts"),
			["refine"],
			{ force: false },
		);
	});

	it("forwards --force to the prompts prune", () => {
		syncPi("/claude", { prune: true, force: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			path.join(harnesses.pi.homeDir, "prompts"),
			["refine"],
			{ force: true },
		);
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

	it("no longer writes ~/.pi/agent/AGENTS.md", () => {
		syncPi("/claude");

		expect(mockCopyFileSync).not.toHaveBeenCalledWith(
			expect.anything(),
			path.join(harnesses.pi.homeDir, "AGENTS.md"),
		);
	});

	it("installs the advice extension from the pi source dir", () => {
		syncPi("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "..", "pi", "advice.ts"),
			path.join(harnesses.pi.homeDir, "extensions", "assist-advice.ts"),
		);
	});

	it("installs the permission-gate and status-driver extensions from the pi source dir", () => {
		syncPi("/claude");

		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "..", "pi", "permission-gate.ts"),
			path.join(
				harnesses.pi.homeDir,
				"extensions",
				"assist-permission-gate.ts",
			),
		);
		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join("/claude", "..", "pi", "status-driver.ts"),
			path.join(harnesses.pi.homeDir, "extensions", "assist-status-driver.ts"),
		);
	});
});
