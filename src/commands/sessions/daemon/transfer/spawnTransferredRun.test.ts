import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { allocateTree } from "../worktree/allocateTree";
import { seedWorktree } from "../worktree/seedWorktree";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";
import { spawnTransferredRun } from "./spawnTransferredRun";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../worktree/allocateTree", () => ({ allocateTree: vi.fn() }));
vi.mock("../worktree/seedWorktree", () => ({
	seedWorktree: vi.fn((_p: string, _c: string, onSeeded: () => void) =>
		onSeeded(),
	),
}));
vi.mock("../worktree/refuseUnallocatedStart", () => ({
	refuseUnallocatedStart: vi.fn(),
}));
vi.mock("./restoreTransferSnapshot", () => ({
	restoreTransferSnapshot: vi.fn(),
}));
vi.mock("../createAssistSession", () => ({
	createAssistSession: vi.fn((id: string) =>
		makeSession({ id, commandType: "assist" }),
	),
}));

function context(): TreeSpawnContext {
	const sessions = new Map<string, Session>();
	return {
		sessions,
		spawnWith: vi.fn((create) => {
			sessions.set("4", create("4"));
			return "4";
		}),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

const snapshot = { ref: "assist/transfer/a1402", branch: "feat/x" };
const run = {
	assistArgs: ["backlog", "run", "a1402"],
	cwd: "/git/assist",
	meta: {},
	snapshot,
	traceId: "abcd1234",
};

describe("spawnTransferredRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(restoreTransferSnapshot).mockResolvedValue();
		vi.mocked(allocateTree).mockReturnValue({
			cwd: "/git/assist-4",
			kind: "worktree",
			created: true,
			clone: "/git/assist",
			ready: Promise.resolve(),
		});
	});

	it("restores into the allocated tree before seeding and starting the run", async () => {
		const ctx = context();
		const discard = vi.fn();
		await expect(spawnTransferredRun(ctx, discard, run)).resolves.toBe("4");
		expect(restoreTransferSnapshot).toHaveBeenCalledWith(
			"/git/assist-4",
			snapshot,
		);
		expect(
			vi.mocked(restoreTransferSnapshot).mock.invocationCallOrder[0],
		).toBeLessThan(vi.mocked(seedWorktree).mock.invocationCallOrder[0]);
		expect(ctx.startHeld).toHaveBeenCalledTimes(1);
		expect(discard).not.toHaveBeenCalled();
	});

	it("discards the target session without starting it when the restore fails", async () => {
		vi.mocked(restoreTransferSnapshot).mockRejectedValue(
			new Error("couldn't find remote ref"),
		);
		const ctx = context();
		const discard = vi.fn();
		await expect(spawnTransferredRun(ctx, discard, run)).rejects.toThrow(
			"restore failed: couldn't find remote ref",
		);
		expect(seedWorktree).not.toHaveBeenCalled();
		expect(ctx.startHeld).not.toHaveBeenCalled();
		expect(discard).toHaveBeenCalledWith("4");
	});

	it("holds an in-place run until the restore completes", async () => {
		vi.mocked(allocateTree).mockReturnValue({
			cwd: "/git/assist",
			kind: "primary",
			created: false,
		});
		const ctx = context();
		await spawnTransferredRun(ctx, vi.fn(), run);
		expect(restoreTransferSnapshot).toHaveBeenCalledWith(
			"/git/assist",
			snapshot,
		);
		expect(ctx.startHeld).toHaveBeenCalledTimes(1);
	});
});
