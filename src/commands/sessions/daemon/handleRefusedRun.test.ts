import { describe, expect, it, vi } from "vitest";
import { duplicateRunExitCode } from "../../backlog/duplicateRunExitCode";
import type { Session } from "./createSession";
import { handlePtyExit } from "./handlePtyExit";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchActivity", () => ({ refreshActivity: vi.fn() }));

function restoredRun(): Session {
	return {
		id: "6",
		name: "backlog run 1093",
		commandType: "assist",
		assistArgs: ["backlog", "run", "1093"],
		status: "waiting",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		waitingSince: 1,
		pty: null,
		scrollback: "Already running: a1093",
		restored: true,
		worktree: { path: "/git/assist-5", clone: "/git/assist" },
	};
}

describe("handlePtyExit on a refused duplicate run", () => {
	it("marks the session errored with why it did not resume, not done", () => {
		const session = restoredRun();
		const onStatusChange = vi.fn();
		handlePtyExit(session, duplicateRunExitCode, onStatusChange);
		expect(onStatusChange).toHaveBeenCalledWith(
			session,
			"error",
			duplicateRunExitCode,
		);
		expect(session.error).toMatch(/not resumed: the original backlog run/);
	});
});
