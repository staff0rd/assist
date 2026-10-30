import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLocked = vi.fn<() => Promise<boolean>>();

vi.mock("../backlog/isDocsLocked", () => ({
	isDocsLocked: () => mockLocked(),
}));

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => "/repo",
}));

import { decideDocsGuard } from "./decideDocsGuard";

function input(toolName: string, filePath: string) {
	return { tool_name: toolName, tool_input: { file_path: filePath } };
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
		},
	);

	it("denies a relative docs path", async () => {
		expect(
			await decideDocsGuard(input("Edit", "docs/CLAUDE.md")),
		).toBeDefined();
	});

	it("allows docs edits while unlocked", async () => {
		mockLocked.mockResolvedValue(false);
		expect(
			await decideDocsGuard(input("Edit", "/repo/docs/CLAUDE.md")),
		).toBeUndefined();
	});

	it("ignores paths outside docs/ without checking the lock", async () => {
		expect(
			await decideDocsGuard(input("Edit", "/repo/src/docs/index.ts")),
		).toBeUndefined();
		expect(mockLocked).not.toHaveBeenCalled();
	});

	it("ignores other tools", async () => {
		expect(
			await decideDocsGuard(input("Read", "/repo/docs/CLAUDE.md")),
		).toBeUndefined();
	});
});
