import { and, asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogDatabase, BacklogOrm } from "./BacklogOrm";
import { items, planPhases, planTasks } from "./backlogSchema";
import { createTestDb } from "./createTestDb";
import { adjustCurrentPhase, reindexPhases } from "./reindexPhases";

async function seedItem(orm: BacklogOrm, currentPhase?: number): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
		currentPhase: currentPhase ?? null,
	});
}

async function seedPhase(
	orm: BacklogOrm,
	idx: number,
	name: string,
	tasks: string[],
): Promise<void> {
	await orm.insert(planPhases).values({ itemId: 1, idx, name });
	if (tasks.length) {
		await orm
			.insert(planTasks)
			.values(
				tasks.map((task, i) => ({ itemId: 1, phaseIdx: idx, idx: i, task })),
			);
	}
}

function getPhases(orm: BacklogOrm) {
	return orm
		.select({ idx: planPhases.idx, name: planPhases.name })
		.from(planPhases)
		.where(eq(planPhases.itemId, 1))
		.orderBy(asc(planPhases.idx));
}

function getTasks(orm: BacklogOrm) {
	return orm
		.select({
			phase_idx: planTasks.phaseIdx,
			idx: planTasks.idx,
			task: planTasks.task,
		})
		.from(planTasks)
		.where(eq(planTasks.itemId, 1))
		.orderBy(asc(planTasks.phaseIdx), asc(planTasks.idx));
}

async function removePhaseInTransaction(
	orm: BacklogOrm,
	itemId: number,
	phaseIdx: number,
	currentPhase?: number,
): Promise<void> {
	await orm.transaction(async (tx: BacklogDatabase) => {
		await tx
			.delete(planTasks)
			.where(
				and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, phaseIdx)),
			);
		await tx
			.delete(planPhases)
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)));
		await reindexPhases(tx, itemId);
		if (currentPhase !== undefined) {
			await adjustCurrentPhase(
				tx,
				{ id: itemId, currentPhase } as never,
				phaseIdx,
			);
		}
	});
}

let orm: BacklogOrm;
let close: () => Promise<void>;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

describe("removePhase reindexing", () => {
	it("removes a middle phase and reindexes without FK errors", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1"]);
		await seedPhase(orm, 2, "Phase C", ["taskC1", "taskC2"]);

		await removePhaseInTransaction(orm, 1, 1);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
			{ phase_idx: 1, idx: 1, task: "taskC2" },
		]);
	});

	it("removes the first phase and reindexes", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1"]);
		await seedPhase(orm, 2, "Phase C", ["taskC1"]);

		await removePhaseInTransaction(orm, 1, 0);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "Phase B" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskB1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
		]);
	});

	it("removes the last phase without needing reindex", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1"]);
		await seedPhase(orm, 2, "Phase C", ["taskC1"]);

		await removePhaseInTransaction(orm, 1, 2);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskB1" },
		]);
	});

	it("removes phase 2 of 4 and reindexes the rest", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);
		await seedPhase(orm, 2, "C", ["c1"]);
		await seedPhase(orm, 3, "D", ["d1"]);

		await removePhaseInTransaction(orm, 1, 1);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "A" },
			{ idx: 1, name: "C" },
			{ idx: 2, name: "D" },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "a1" },
			{ phase_idx: 1, idx: 0, task: "c1" },
			{ phase_idx: 2, idx: 0, task: "d1" },
		]);
	});
});
