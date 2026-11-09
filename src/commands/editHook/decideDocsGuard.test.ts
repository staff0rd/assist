import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLocked = vi.fn<() => Promise<boolean>>();

vi.mock("../backlog/isDocsLocked", () => ({
	isDocsLocked: () => mockLocked(),
}));

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => "/repo",
}));

import { claudeToolOperations } from "../../shared/harnessAdapters/claudeToolOperations";
import type { ToolOperation } from "../../shared/harnessAdapters/types";
import { decideDocsGuard as decideWrite } from "./decideDocsGuard";

function input(toolName: string, filePath: string): ToolOperation[] {
	return claudeToolOperations({ toolName, toolInput: { file_path: filePath } });
}

async function decideDocsGuard(operations: ToolOperation[]) {
	const [operation] = operations;
	return operation?.kind === "fileWrite" ? decideWrite(operation) : undefined;
}

describe("decideDocsGuard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocked.mockResolvedValue(true);
	});

	it.each(["Edit", "Write", "MultiEdit"])(
		"denies %s under docs/ while locked",
		async (tool) => {
			const reason = await decideDocsGuard(
				input(tool, "/repo/docs/src/content/docs/index.md"),
			);
			expect(reason).toContain("Refresh docs");
			expect(reason).toContain("assist docs unlock");
		},
	);

	it.each(["docs/src/content/docs/index.md", "docs/public/screenshots/a.png"])(
		"denies the relative path %s",
		async (path) => {
			expect(await decideDocsGuard(input("Edit", path))).toBeDefined();
		},
	);

	it("allows docs edits while unlocked", async () => {
		mockLocked.mockResolvedValue(false);
		expect(
			await decideDocsGuard(
				input("Edit", "/repo/docs/src/content/docs/index.md"),
			),
		).toBeUndefined();
	});

	it.each([
		"/repo/src/docs/index.ts",
		"/repo/docs/CLAUDE.md",
		"/repo/docs/astro.config.ts",
		"/repo/docs/src/styles/diff.css",
	])("ignores %s without checking the lock", async (path) => {
		expect(await decideDocsGuard(input("Edit", path))).toBeUndefined();
		expect(mockLocked).not.toHaveBeenCalled();
	});

	it("ignores other tools", async () => {
		expect(
			await decideDocsGuard(input("Read", "/repo/docs/CLAUDE.md")),
		).toBeUndefined();
	});
});
