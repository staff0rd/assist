import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";

vi.mock("../../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { insertPhaseAt } from "../insertPhaseAt";
import { reorderPhaseRows } from "../reorderPhaseRows";
import { replacePlan } from "../updatePlan/replacePlan";
import { loadPhaseProgress } from "./loadPhaseProgress";
import { markPhaseDone } from "./markPhaseDone";
import { resetPhaseAndDependents } from "./resetPhaseAndDependents";
import { setPhaseRunState } from "./setPhaseRunState";

let orm: Db;
let close: () => Promise<void>;

const fanOut = [undefined, [1], [1], [2, 3]];

async function seedPlan(currentPhase: number): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
		currentPhase,
	});
	await replacePlan(
		orm,
		1,
		fanOut.map((deps, i) => ({
			name: `P${i + 1}`,
			tasks: ["t"],
			manualChecks: [],
			...(deps ? { dependsOn: deps } : {}),
		})),
		undefined,
	);
}

async function currentPhase(): Promise<number | null> {
	const [row] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, 1));
	return row.currentPhase;
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

describe("phase run state", () => {
	it("keeps currentPhase on the lowest unfinished phase as phases finish out of order", async () => {
		await seedPlan(2);
		await setPhaseRunState(orm, 1, [1, 2], "running", "t");

		await markPhaseDone(orm, 1, 2, 4);
		expect(await currentPhase()).toBe(2);

		await markPhaseDone(orm, 1, 1, 4);
		expect(await currentPhase()).toBe(4);
	});

	it("resets a rewound phase and its dependents, leaving independent phases", async () => {
		await seedPlan(2);
		await setPhaseRunState(orm, 1, [1], "done");
		await setPhaseRunState(orm, 1, [2], "running", "t");
		await setPhaseRunState(orm, 1, [3], "running", "t");
		const plan = fanOut.map((dependsOn) => ({
			name: "",
			tasks: [],
			...(dependsOn ? { dependsOn } : {}),
		}));

		await resetPhaseAndDependents(orm, 1, plan, 1);

		const progress = await loadPhaseProgress(orm, 1);
		expect(progress.done).toEqual([]);
		expect(progress.running).toEqual([2]);
	});

	it("moves run state with its phase when phases are reordered or the plan is rewritten", async () => {
		await seedPlan(1);
		await setPhaseRunState(orm, 1, [2], "running", "t");

		await reorderPhaseRows(orm, 1, 2, 1);
		expect((await loadPhaseProgress(orm, 1)).running).toEqual([1]);

		await replacePlan(
			orm,
			1,
			["P1", "P3", "P2", "P4"].map((name) => ({
				name,
				tasks: ["t"],
				manualChecks: [],
			})),
			undefined,
		);
		expect((await loadPhaseProgress(orm, 1)).running).toEqual([1]);
	});

	it("re-runs the phases depending on one inserted ahead of currentPhase", async () => {
		await seedPlan(4);
		await setPhaseRunState(orm, 1, [1, 2], "done");

		await insertPhaseAt(orm, 1, 1, "New", ["t"], null, 4);

		expect(await currentPhase()).toBe(2);
		expect((await loadPhaseProgress(orm, 1)).done).toEqual([3]);
	});
});
