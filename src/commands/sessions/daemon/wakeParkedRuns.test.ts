import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { holdingWakes } from "./holdingWakes";
import { spawnAssistProcess } from "./spawnAssistProcess";
import { wakeParkedRuns } from "./wakeParkedRuns";
import { wirePtyEvents } from "./wirePtyEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./spawnAssistProcess", () => ({
	spawnAssistProcess: vi.fn(() => ({ resize: vi.fn() })),
}));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

function parkedRun(): Session {
	return makeSession({
		id: "1",
		commandType: "assist",
		assistArgs: ["backlog", "run", "a1682"],
		cwd: "/git/assist-3",
		status: "parked",
		runningMs: 5_000,
	});
}

function phase(id: string, overrides: Partial<Session>): Session {
	return makeSession({
		id,
		commandType: "assist",
		assistArgs: ["backlog", "run-phase", "a1682", id],
		launchedFrom: "1",
		...overrides,
	});
}

function wake(...list: Session[]): void {
	wakeParkedRuns(new Map(list.map((s) => [s.id, s])), new Set(), vi.fn());
}

describe("wakeParkedRuns", () => {
	beforeEach(() => vi.clearAllMocks());

	it("leaves a run parked while one of its phases is alive", () => {
		const run = parkedRun();
		wake(
			run,
			phase("2", { status: "done" }),
			phase("3", { status: "running" }),
		);
		expect(run.status).toBe("parked");
		expect(spawnAssistProcess).not.toHaveBeenCalled();
	});

	it("restarts the run in wake mode once every phase has ended, keeping its working time", () => {
		const run = parkedRun();
		wake(run, phase("2", { status: "done" }), phase("3", { status: "error" }));
		expect(run.status).toBe("running");
		expect(run.runningMs).toBe(5_000);
		expect(spawnAssistProcess).toHaveBeenCalledWith(
			["assist", "backlog", "run", "a1682"],
			"/git/assist-3",
			"1",
			{ ASSIST_BACKLOG_WAKE: "1" },
		);
		expect(wirePtyEvents).toHaveBeenCalledWith(
			run,
			expect.any(Set),
			expect.any(Function),
		);
	});

	it("wakes a run whose phase cards were dismissed", () => {
		const run = parkedRun();
		wake(run);
		expect(run.status).toBe("running");
	});

	it("ignores phases launched by another run", () => {
		const run = parkedRun();
		wake(run, phase("2", { status: "running", launchedFrom: "9" }));
		expect(run.status).toBe("running");
	});
});

describe("wakeParkedRuns while a restore holds wakes", () => {
	it("leaves the run parked until the restore finishes", () => {
		const run = parkedRun();
		const sessions = new Map([[run.id, run]]);
		holdingWakes(sessions, () => wakeParkedRuns(sessions, new Set(), vi.fn()));
		expect(run.status).toBe("parked");
		wakeParkedRuns(sessions, new Set(), vi.fn());
		expect(run.status).toBe("running");
	});
});
