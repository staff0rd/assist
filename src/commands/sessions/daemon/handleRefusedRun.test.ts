import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { duplicateRunExitCode } from "../../backlog/duplicateRunExitCode";
import { handlePtyExit } from "./handlePtyExit";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchActivity", () => ({ refreshActivity: vi.fn() }));

describe("handlePtyExit on a refused duplicate run", () => {
	it("marks the session errored with why it did not resume, not done", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["backlog", "run", "1093"],
			status: "waiting",
			waitingSince: 1,
			scrollback: "Already running: a1093",
			restored: true,
			worktree: { path: "/git/assist-5", clone: "/git/assist" },
		});
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
