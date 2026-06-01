import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogDb } from "./BacklogDb";
import { createTestDb } from "./createTestDb";
import { insertPhaseAt } from "./insertPhaseAt";

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

async function getCurrentPhase(db: BacklogDb): Promise<number | null> {
	const row = await db.get<{ current_phase: number | null }>(
		"SELECT current_phase FROM items WHERE id = 1",
	);
	return row?.current_phase ?? null;
}

let db: BacklogDb;
let close: () => Promise<void>;

beforeEach(async () => {
	({ db, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

describe("insertPhaseAt", () => {
	it("inserts at the beginning and shifts existing phases", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1", "taskB2"]);

		await insertPhaseAt(db, 1, 0, "New First", ["newTask"], null, undefined);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "New First" },
			{ idx: 1, name: "Phase A" },
			{ idx: 2, name: "Phase B" },
		]);

		expect(await getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "newTask" },
			{ phase_idx: 1, idx: 0, task: "taskA1" },
			{ phase_idx: 2, idx: 0, task: "taskB1" },
			{ phase_idx: 2, idx: 1, task: "taskB2" },
		]);
	});

	it("inserts in the middle", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1"]);
		await seedPhase(db, 2, "Phase C", ["taskC1"]);

		await insertPhaseAt(db, 1, 1, "Middle", ["midTask"], null, undefined);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Middle" },
			{ idx: 2, name: "Phase B" },
			{ idx: 3, name: "Phase C" },
		]);
	});

	it("inserts at the end (append)", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);
		await seedPhase(db, 1, "Phase B", ["taskB1"]);

		await insertPhaseAt(db, 1, 2, "Appended", ["endTask"], null, undefined);

		expect(await getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
			{ idx: 2, name: "Appended" },
		]);
	});

	it("stores manual checks on the new phase", async () => {
		await seedItem(db);
		await seedPhase(db, 0, "Phase A", ["taskA1"]);

		const checks = JSON.stringify(["check1", "check2"]);
		await insertPhaseAt(db, 1, 0, "Checked", ["t1"], checks, undefined);

		const row = await db.get<{ manual_checks: string | null }>(
			"SELECT manual_checks FROM plan_phases WHERE item_id = 1 AND idx = 0",
		);
		expect(JSON.parse(row?.manual_checks ?? "null")).toEqual([
			"check1",
			"check2",
		]);
	});

	describe("currentPhase adjustment", () => {
		it("increments currentPhase when inserting at its position", async () => {
			await seedItem(db, 2);
			await seedPhase(db, 0, "A", ["t"]);
			await seedPhase(db, 1, "B", ["t"]);
			await seedPhase(db, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 1 pushes it down
			await insertPhaseAt(db, 1, 1, "New", ["t"], null, 2);

			expect(await getCurrentPhase(db)).toBe(3);
		});

		it("does not adjust currentPhase when inserting just past it", async () => {
			await seedItem(db, 2);
			await seedPhase(db, 0, "A", ["t"]);
			await seedPhase(db, 1, "B", ["t"]);
			await seedPhase(db, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 2 is after it
			await insertPhaseAt(db, 1, 2, "New", ["t"], null, 2);

			expect(await getCurrentPhase(db)).toBe(2);
		});

		it("does not adjust currentPhase when inserting well after it", async () => {
			await seedItem(db, 1);
			await seedPhase(db, 0, "A", ["t"]);
			await seedPhase(db, 1, "B", ["t"]);

			await insertPhaseAt(db, 1, 2, "New", ["t"], null, 1);

			expect(await getCurrentPhase(db)).toBe(1);
		});

		it("does not adjust when currentPhase is undefined", async () => {
			await seedItem(db);
			await seedPhase(db, 0, "A", ["t"]);

			await insertPhaseAt(db, 1, 0, "New", ["t"], null, undefined);

			expect(await getCurrentPhase(db)).toBeNull();
		});
	});
});
