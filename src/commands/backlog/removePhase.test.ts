import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogDb } from "./BacklogDb";
import { createTestDb } from "./createTestDb";
import { adjustCurrentPhase, reindexPhases } from "./reindexPhases";

async function seedItem(db: BacklogDb, currentPhase?: number): Promise<void> {
	await db.run(
		"INSERT INTO items (id, origin, name, status, current_phase) VALUES (1, 'test', 'Test', 'in-progress', ?)",
		[currentPhase ?? null],
	);
}

async function seedPhase(
	db: BacklogDb,
	idx: number,
	name: string,
	tasks: string[],
): Promise<void> {
	await db.run(
		"INSERT INTO plan_phases (item_id, idx, name) VALUES (1, ?, ?)",
		[idx, name],
	);
	for (let i = 0; i < tasks.length; i++) {
		await db.run(
			"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (1, ?, ?, ?)",
			[idx, i, tasks[i]],
		);
	}
}

function getPhases(db: BacklogDb) {
	return db.all<{ idx: number; name: string }>(
		"SELECT idx, name FROM plan_phases WHERE item_id = 1 ORDER BY idx",
	);
}

function getTasks(db: BacklogDb) {
	return db.all<{ phase_idx: number; idx: number; task: string }>(
		"SELECT phase_idx, idx, task FROM plan_tasks WHERE item_id = 1 ORDER BY phase_idx, idx",
	);
}

async function removePhaseInTransaction(
	db: BacklogDb,
	itemId: number,
	phaseIdx: number,
	currentPhase?: number,
): Promise<void> {
	await db.transaction(async (tx) => {
		await tx.run("DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?", [
			itemId,
			phaseIdx,
		]);
		await tx.run("DELETE FROM plan_phases WHERE item_id = ? AND idx = ?", [
			itemId,
			phaseIdx,
		]);
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

let db: BacklogDb;
let close: () => Promise<void>;

beforeEach(async () => {
	({ db, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

describe("removePhase reindexing", () => {
	it("removes a middle phase and reindexes without FK errors", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1"]);
		await seedPhase(db, 2, "Phase C", ["taskC1", "taskC2"]);

		await removePhaseInTransaction(db, 1, 1);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(await getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
			{ phase_idx: 1, idx: 1, task: "taskC2" },
		]);
	});

	it("removes the first phase and reindexes", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1"]);
		await seedPhase(db, 2, "Phase C", ["taskC1"]);

		await removePhaseInTransaction(db, 1, 0);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "Phase B" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(await getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskB1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
		]);
	});

	it("removes the last phase without needing reindex", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1"]);
		await seedPhase(db, 2, "Phase C", ["taskC1"]);

		await removePhaseInTransaction(db, 1, 2);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
		]);
		expect(await getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskB1" },
		]);
	});

	it("removes phase 2 of 4 and reindexes the rest", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "A", ["a1"]);
		await seedPhase(db, 1, "B", ["b1"]);
		await seedPhase(db, 2, "C", ["c1"]);
		await seedPhase(db, 3, "D", ["d1"]);

		await removePhaseInTransaction(db, 1, 1);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "A" },
			{ idx: 1, name: "C" },
			{ idx: 2, name: "D" },
		]);
		expect(await getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "a1" },
			{ phase_idx: 1, idx: 0, task: "c1" },
			{ phase_idx: 2, idx: 0, task: "d1" },
		]);
	});
});
