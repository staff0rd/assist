import { describe, expect, it } from "vitest";
import type { PlanPhase } from "../types";
import { dependentPhases } from "./dependentPhases";
import type { PhaseProgress } from "./PhaseProgress";
import { schedulePhases } from "./schedulePhases";

function phase(dependsOn?: number[]): PlanPhase {
	return { name: "p", tasks: [], ...(dependsOn ? { dependsOn } : {}) };
}

function progress(overrides: Partial<PhaseProgress> = {}): PhaseProgress {
	return { currentPhase: 1, running: [], done: [], failed: [], ...overrides };
}

const fanOut = [phase(), phase([1]), phase([1]), phase([2, 3])];

describe("schedulePhases", () => {
	it("readies only the next phase of a plan without dependencies", () => {
		const plan = [phase(), phase(), phase()];
		expect(schedulePhases(plan, progress({ currentPhase: 2 }))).toEqual({
			allDone: false,
			running: [],
			ready: [1],
			failed: [],
		});
	});

	it("readies every phase whose dependencies are done", () => {
		expect(schedulePhases(fanOut, progress({ currentPhase: 2 })).ready).toEqual(
			[1, 2],
		);
	});

	it("waits for every dependency, counting explicit done above currentPhase", () => {
		const waiting = schedulePhases(
			fanOut,
			progress({ currentPhase: 2, done: [2], running: [1] }),
		);
		expect(waiting.ready).toEqual([]);
		expect(waiting.running).toEqual([1]);

		const ready = schedulePhases(
			fanOut,
			progress({ currentPhase: 2, done: [1, 2] }),
		);
		expect(ready.ready).toEqual([3]);
	});

	it("reports failed phases and all-done", () => {
		expect(
			schedulePhases(fanOut, progress({ currentPhase: 2, failed: [1] })).failed,
		).toEqual([1]);
		expect(schedulePhases(fanOut, progress({ currentPhase: 5 })).allDone).toBe(
			true,
		);
	});
});

describe("dependentPhases", () => {
	it("follows dependencies transitively, leaving independent phases out", () => {
		expect(dependentPhases(fanOut, 1)).toEqual([1, 3]);
		expect(dependentPhases(fanOut, 0)).toEqual([0, 1, 2, 3]);
	});
});
