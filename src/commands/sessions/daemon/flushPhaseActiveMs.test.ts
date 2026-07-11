import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const persistPhaseActiveMs =
	vi.fn<
		(itemId: number, phaseIdx: number, activeMs: number) => Promise<boolean>
	>();

vi.mock("./persistPhaseActiveMs", () => ({
	persistPhaseActiveMs: (itemId: number, phaseIdx: number, activeMs: number) =>
		persistPhaseActiveMs(itemId, phaseIdx, activeMs),
}));

import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import type { Session } from "./types";

function backlogSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1000,
		runningMs: 0,
		runningSince: 1000,
		pty: null,
		scrollback: "",
		activity: { kind: "backlog", startedAt: 1000, itemId: 7, phase: 2 },
		...overrides,
	};
}

describe("flushPhaseActiveMs", () => {
	beforeEach(() => {
		persistPhaseActiveMs.mockReset();
		persistPhaseActiveMs.mockResolvedValue(true);
		vi.useFakeTimers();
		vi.setSystemTime(1000);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("persists the elapsed interval and advances the watermark", async () => {
		const session = backlogSession();
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).toHaveBeenCalledWith(7, 1, 5000);
		expect(session.activeMsFlushedForStretch).toEqual({
			since: 1000,
			ms: 5000,
		});
	});

	it("persists only the new delta on a later flush", async () => {
		const session = backlogSession();
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		vi.setSystemTime(9000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).toHaveBeenLastCalledWith(7, 1, 3000);
		expect(session.activeMsFlushedForStretch).toEqual({
			since: 1000,
			ms: 8000,
		});
	});

	it("does nothing when the session is not running", async () => {
		const session = backlogSession({ status: "waiting", runningSince: null });
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).not.toHaveBeenCalled();
	});

	it("does nothing when the session is not on a backlog phase", async () => {
		const session = backlogSession({
			activity: { kind: "command", startedAt: 1000 },
		});
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).not.toHaveBeenCalled();
	});

	it("leaves the watermark unadvanced on a failed write, retrying the interval next flush", async () => {
		persistPhaseActiveMs.mockResolvedValueOnce(false);
		const session = backlogSession();
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		expect(session.activeMsFlushedForStretch).toBeUndefined();
		vi.setSystemTime(9000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).toHaveBeenLastCalledWith(7, 1, 8000);
		expect(session.activeMsFlushedForStretch).toEqual({
			since: 1000,
			ms: 8000,
		});
	});

	it("resets the watermark for a new running stretch", async () => {
		const session = backlogSession();
		vi.setSystemTime(6000);
		await flushPhaseActiveMs(session);
		session.runningSince = 20000;
		vi.setSystemTime(23000);
		await flushPhaseActiveMs(session);
		expect(persistPhaseActiveMs).toHaveBeenLastCalledWith(7, 1, 3000);
		expect(session.activeMsFlushedForStretch).toEqual({
			since: 20000,
			ms: 3000,
		});
	});

	it("serializes concurrent flushes so an interval is never double-counted", async () => {
		const session = backlogSession();
		vi.setSystemTime(6000);
		await Promise.all([
			flushPhaseActiveMs(session),
			flushPhaseActiveMs(session),
		]);
		expect(persistPhaseActiveMs).toHaveBeenCalledTimes(1);
		expect(persistPhaseActiveMs).toHaveBeenCalledWith(7, 1, 5000);
		expect(session.activeMsFlushedForStretch).toEqual({
			since: 1000,
			ms: 5000,
		});
	});
});
