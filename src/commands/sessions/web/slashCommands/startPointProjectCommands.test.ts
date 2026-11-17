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
		expect(await startPointProjectCommands("/repo/sub")).toEqual([
			{ name: "helm", scope: "project" },
		]);
		expect(mockStartPoint).toHaveBeenCalledWith("/clone", false);
		expect(mockReadAtRef).toHaveBeenCalledWith(
			"/clone",
			"origin/main",
			"project",
		);
	});

	it("returns null when worktrees are off, since sessions run in the working tree", async () => {
		mockConfig.mockReturnValue({ enabled: false, trunk: false });
		expect(await startPointProjectCommands("/repo")).toBeNull();
		expect(mockStartPoint).not.toHaveBeenCalled();
	});

	it("returns null when the start point falls back to HEAD", async () => {
		mockStartPoint.mockResolvedValue({ ref: "HEAD", track: false });
		expect(await startPointProjectCommands("/repo")).toBeNull();
		expect(mockReadAtRef).not.toHaveBeenCalled();
	});
});
