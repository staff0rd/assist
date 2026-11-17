import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConfig = vi.fn();
const mockStartPoint = vi.fn();
const mockReadAtRef = vi.fn();

vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: () => "/repo",
}));
vi.mock("../../daemon/worktree/listWorktreePaths", () => ({
	mainWorktree: () => "/clone",
}));
vi.mock("../../daemon/worktree/worktreeConfigFor", () => ({
	worktreeConfigFor: (...args: unknown[]) => mockConfig(...args),
}));
vi.mock("../../daemon/worktree/worktreeStartPoint", () => ({
	worktreeStartPoint: (...args: unknown[]) => mockStartPoint(...args),
}));
vi.mock("./readSlashCommandsAtRef", () => ({
	readSlashCommandsAtRef: (...args: unknown[]) => mockReadAtRef(...args),
}));

import { startPointProjectCommands } from "./startPointProjectCommands";

describe("startPointProjectCommands", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockConfig.mockReturnValue({ enabled: true, trunk: false });
		mockStartPoint.mockResolvedValue({ ref: "origin/main", track: false });
		mockReadAtRef.mockResolvedValue([{ name: "helm", scope: "project" }]);
	});

	it("reads the clone's project commands at the worktree start point", async () => {
		expect(await startPointProjectCommands("/repo/sub", [".claude"])).toEqual([
			{ name: "helm", scope: "project" },
		]);
		expect(mockStartPoint).toHaveBeenCalledWith("/clone", false);
		expect(mockReadAtRef).toHaveBeenCalledWith(
			"/clone",
			"origin/main",
			"project",
			".claude",
		);
	});

	it("merges each project dir at the start point, first dir winning", async () => {
		mockReadAtRef.mockImplementation(
			async (_repo: string, _ref: string, _scope: string, dir: string) =>
				dir === ".agents"
					? [{ name: "commit", description: "A", scope: "project" }]
					: [
							{ name: "commit", description: "C", scope: "project" },
							{ name: "cook", scope: "project" },
						],
		);
		expect(
			await startPointProjectCommands("/repo", [".agents", ".codex"]),
		).toEqual([
			{ name: "commit", description: "A", scope: "project" },
			{ name: "cook", scope: "project" },
		]);
	});

	it("returns null when the start point does not resolve", async () => {
		mockReadAtRef.mockResolvedValue(null);
		expect(
			await startPointProjectCommands("/repo", [".agents", ".codex"]),
		).toBeNull();
	});

	it("returns null when worktrees are off, since sessions run in the working tree", async () => {
		mockConfig.mockReturnValue({ enabled: false, trunk: false });
		expect(await startPointProjectCommands("/repo", [".claude"])).toBeNull();
		expect(mockStartPoint).not.toHaveBeenCalled();
	});

	it("returns null when the start point falls back to HEAD", async () => {
		mockStartPoint.mockResolvedValue({ ref: "HEAD", track: false });
		expect(await startPointProjectCommands("/repo", [".claude"])).toBeNull();
		expect(mockReadAtRef).not.toHaveBeenCalled();
	});
});
