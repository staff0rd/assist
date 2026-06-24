import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { noteOutputForThinking } from "./noteOutputForThinking";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function makeSession(status: Session["status"] = "waiting"): Session {
	return {
		id: "1",
		name: "test",
		commandType: "claude",
		status,
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
	};
}

describe("noteOutputForThinking", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("when the session is waiting", () => {
		it("flips to running once output has streamed for the activation window", () => {
			const session = makeSession("waiting");
			const onStatusChange = vi.fn();

			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(400);
			noteOutputForThinking(session, onStatusChange);
			expect(onStatusChange).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			noteOutputForThinking(session, onStatusChange);
			expect(onStatusChange).toHaveBeenCalledWith(session, "running");
		});

		it("ignores a lone render burst that settles before the activation window", () => {
			const session = makeSession("waiting");
			const onStatusChange = vi.fn();

			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(50);
			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(10_000);

			expect(onStatusChange).not.toHaveBeenCalled();
		});

		it("restarts the streak after a gap so stale bursts do not combine", () => {
			const session = makeSession("waiting");
			const onStatusChange = vi.fn();

			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(2_000);
			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(100);
			noteOutputForThinking(session, onStatusChange);
			expect(onStatusChange).not.toHaveBeenCalled();

			vi.advanceTimersByTime(400);
			noteOutputForThinking(session, onStatusChange);
			expect(onStatusChange).toHaveBeenCalledWith(session, "running");
		});
	});

	describe("when the session is not waiting", () => {
		it("does nothing and clears any pending streak", () => {
			const session = makeSession("running");
			const onStatusChange = vi.fn();

			noteOutputForThinking(session, onStatusChange);
			vi.advanceTimersByTime(1_000);
			noteOutputForThinking(session, onStatusChange);

			expect(onStatusChange).not.toHaveBeenCalled();
			expect(session.thinkingStreakStart).toBeUndefined();
		});
	});
});
