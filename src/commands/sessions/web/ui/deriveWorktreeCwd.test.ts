import { describe, expect, it } from "vitest";
import { deriveWorktreeCwd } from "./deriveWorktreeCwd";
import type { HistoricalSession, SessionInfo } from "./types";

const sessions: SessionInfo[] = [
	{
		id: "plain",
		name: "plain",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd: "/repos/live",
	},
	{
		id: "worktree",
		name: "worktree",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd: "/repos/live/.worktrees/feature",
		repoGroup: { origin: "host/org/live", clone: "/repos/live" },
	},
	{
		id: "no-cwd",
		name: "no cwd",
		commandType: "claude",
		status: "running",
		startedAt: 0,
	},
];

const history: HistoricalSession[] = [
	{
		sessionId: "past-worktree",
		name: "old",
		project: "proj",
		cwd: "/repos/live/.worktrees/old",
		timestamp: "2026-01-01",
		repoGroup: { origin: "host/org/live", clone: "/repos/live" },
	},
];

describe("deriveWorktreeCwd", () => {
	it("returns the active card's worktree rather than the clone", () => {
		expect(
			deriveWorktreeCwd("worktree", sessions, history, "/repos/live"),
		).toBe("/repos/live/.worktrees/feature");
	});

	it("returns the worktree of an active history card", () => {
		expect(
			deriveWorktreeCwd("past-worktree", sessions, history, "/repos/live"),
		).toBe("/repos/live/.worktrees/old");
	});

	it("returns the selection when no card is active", () => {
		expect(deriveWorktreeCwd(null, sessions, history, "/repos/live")).toBe(
			"/repos/live",
		);
	});

	it("returns the clone for a card that runs in it", () => {
		expect(deriveWorktreeCwd("plain", sessions, history, "/repos/live")).toBe(
			"/repos/live",
		);
	});

	it("returns the selection for a card with no cwd", () => {
		expect(deriveWorktreeCwd("no-cwd", sessions, history, "/repos/live")).toBe(
			"/repos/live",
		);
	});

	it("follows the active card even when another repo is picked", () => {
		expect(
			deriveWorktreeCwd("worktree", sessions, history, "/repos/other"),
		).toBe("/repos/live/.worktrees/feature");
	});

	it("follows a history card whose clone is not the picked repo", () => {
		expect(
			deriveWorktreeCwd("past-worktree", sessions, history, "/repos/other"),
		).toBe("/repos/live/.worktrees/old");
	});

	it("returns the selection for an unknown active id", () => {
		expect(deriveWorktreeCwd("gone", sessions, history, "/repos/live")).toBe(
			"/repos/live",
		);
	});
});
