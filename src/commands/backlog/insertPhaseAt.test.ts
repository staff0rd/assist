import { and, asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases, planTasks } from "../../shared/db/schema";
import { insertPhaseAt } from "./insertPhaseAt";

async function seedItem(orm: Db, currentPhase?: number): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
		currentPhase: currentPhase ?? null,
	});
}

async function seedPhase(
	orm: Db,
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

function getPhases(orm: Db) {
	return orm
		.select({ idx: planPhases.idx, name: planPhases.name })
		.from(planPhases)
		.where(eq(planPhases.itemId, 1))
		.orderBy(asc(planPhases.idx));
}

function getTasks(orm: Db) {
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

async function getCurrentPhase(orm: Db): Promise<number | null> {
	const [row] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, 1));
	return row?.currentPhase ?? null;
}

let orm: Db;
let close: () => Promise<void>;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

describe("insertPhaseAt", () => {
	it("inserts at the beginning and shifts existing phases", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1", "taskB2"]);

		await insertPhaseAt(orm, 1, 0, "New First", ["newTask"], null, undefined);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "New First" },
			{ idx: 1, name: "Phase A" },
			{ idx: 2, name: "Phase B" },
		]);

		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "newTask" },
			{ phase_idx: 1, idx: 0, task: "taskA1" },
			{ phase_idx: 2, idx: 0, task: "taskB1" },
			{ phase_idx: 2, idx: 1, task: "taskB2" },
		]);
	});

	it("inserts in the middle", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1"]);
		await seedPhase(orm, 2, "Phase C", ["taskC1"]);

		await insertPhaseAt(orm, 1, 1, "Middle", ["midTask"], null, undefined);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Middle" },
			{ idx: 2, name: "Phase B" },
			{ idx: 3, name: "Phase C" },
		]);
	});

	it("inserts at the end (append)", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);
		await seedPhase(orm, 1, "Phase B", ["taskB1"]);

		await insertPhaseAt(orm, 1, 2, "Appended", ["endTask"], null, undefined);

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
			{ idx: 2, name: "Appended" },
		]);
	});

	it("stores manual checks on the new phase", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "Phase A", ["taskA1"]);

		const checks = JSON.stringify(["check1", "check2"]);
		await insertPhaseAt(orm, 1, 0, "Checked", ["t1"], checks, undefined);

		const [row] = await orm
			.select({ manualChecks: planPhases.manualChecks })
			.from(planPhases)
			.where(and(eq(planPhases.itemId, 1), eq(planPhases.idx, 0)));
		expect(JSON.parse(row?.manualChecks ?? "null")).toEqual([
			"check1",
			"check2",
		]);
	});

	describe("currentPhase adjustment", () => {
		it("increments currentPhase when inserting at its position", async () => {
			await seedItem(orm, 2);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);
			await seedPhase(orm, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 1 pushes it down
			await insertPhaseAt(orm, 1, 1, "New", ["t"], null, 2);

			expect(await getCurrentPhase(orm)).toBe(3);
		});

		it("does not adjust currentPhase when inserting just past it", async () => {
			await seedItem(orm, 2);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);
			await seedPhase(orm, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 2 is after it
			await insertPhaseAt(orm, 1, 2, "New", ["t"], null, 2);

			expect(await getCurrentPhase(orm)).toBe(2);
		});

		it("does not adjust currentPhase when inserting well after it", async () => {
			await seedItem(orm, 1);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);

			await insertPhaseAt(orm, 1, 2, "New", ["t"], null, 1);

			expect(await getCurrentPhase(orm)).toBe(1);
		});

		it("rewinds to a phase appended while at the review slot", async () => {
			await seedItem(orm, 3);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);

			// currentPhase 3 = review slot (both authored phases complete);
			// appending must not push currentPhase past the new phase.
			await insertPhaseAt(orm, 1, 2, "New", ["t"], null, 3);

			expect(await getCurrentPhase(orm)).toBe(3);
		});

		it("rewinds to a phase inserted mid-plan while at the review slot", async () => {
			await seedItem(orm, 4);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);
			await seedPhase(orm, 2, "C", ["t"]);

			// currentPhase 4 = review slot; inserting at index 1 rewinds to it.
			await insertPhaseAt(orm, 1, 1, "New", ["t"], null, 4);

			expect(await getCurrentPhase(orm)).toBe(2);
		});

		it("rewinds when the review phase has already completed", async () => {
			await seedItem(orm, 4);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);

			// currentPhase 4 = review complete; appending rewinds to the new phase.
			await insertPhaseAt(orm, 1, 2, "New", ["t"], null, 4);

			expect(await getCurrentPhase(orm)).toBe(3);
		});

		it("keeps pointing at the first added phase when appending a second", async () => {
			await seedItem(orm, 3);
			await seedPhase(orm, 0, "A", ["t"]);
			await seedPhase(orm, 1, "B", ["t"]);
			await seedPhase(orm, 2, "First added", ["t"]);

			// currentPhase 3 already rewound to "First added"; appending another
			// phase after it must not move the pointer.
			await insertPhaseAt(orm, 1, 3, "Second added", ["t"], null, 3);

			expect(await getCurrentPhase(orm)).toBe(3);
		});

		it("does not adjust when currentPhase is undefined", async () => {
			await seedItem(orm);
			await seedPhase(orm, 0, "A", ["t"]);

			await insertPhaseAt(orm, 1, 0, "New", ["t"], null, undefined);

			expect(await getCurrentPhase(orm)).toBeNull();
		});
	});
});
