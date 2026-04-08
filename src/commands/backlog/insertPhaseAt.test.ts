import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { insertPhaseAt } from "./insertPhaseAt";

function createDb(): ReturnType<typeof Database> {
	const db = new Database(":memory:");
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON");
	db.exec(`
		CREATE TABLE items (
			id INTEGER PRIMARY KEY,
			type TEXT NOT NULL DEFAULT 'story',
			name TEXT NOT NULL,
			description TEXT,
			acceptance_criteria TEXT NOT NULL DEFAULT '[]',
			status TEXT NOT NULL DEFAULT 'todo',
			current_phase INTEGER
		);
		CREATE TABLE plan_phases (
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			idx INTEGER NOT NULL,
			name TEXT NOT NULL,
			manual_checks TEXT,
			PRIMARY KEY (item_id, idx)
		);
		CREATE TABLE plan_tasks (
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			phase_idx INTEGER NOT NULL,
			idx INTEGER NOT NULL,
			task TEXT NOT NULL,
			PRIMARY KEY (item_id, phase_idx, idx),
			FOREIGN KEY (item_id, phase_idx) REFERENCES plan_phases(item_id, idx) ON DELETE CASCADE
		);
	`);
	return db;
}

function seedItem(
	db: ReturnType<typeof Database>,
	currentPhase?: number,
): void {
	db.prepare(
		"INSERT INTO items (id, name, status, current_phase) VALUES (1, 'Test', 'in-progress', ?)",
	).run(currentPhase ?? null);
}

function seedPhase(
	db: ReturnType<typeof Database>,
	idx: number,
	name: string,
	tasks: string[],
): void {
	db.prepare(
		"INSERT INTO plan_phases (item_id, idx, name) VALUES (1, ?, ?)",
	).run(idx, name);
	const stmt = db.prepare(
		"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (1, ?, ?, ?)",
	);
	for (let i = 0; i < tasks.length; i++) {
		stmt.run(idx, i, tasks[i]);
	}
}

function getPhases(db: ReturnType<typeof Database>) {
	return db
		.prepare("SELECT idx, name FROM plan_phases WHERE item_id = 1 ORDER BY idx")
		.all() as { idx: number; name: string }[];
}

function getTasks(db: ReturnType<typeof Database>) {
	return db
		.prepare(
			"SELECT phase_idx, idx, task FROM plan_tasks WHERE item_id = 1 ORDER BY phase_idx, idx",
		)
		.all() as { phase_idx: number; idx: number; task: string }[];
}

function getCurrentPhase(db: ReturnType<typeof Database>): number | null {
	const row = db
		.prepare("SELECT current_phase FROM items WHERE id = 1")
		.get() as {
		current_phase: number | null;
	};
	return row.current_phase;
}

let db: ReturnType<typeof Database>;

beforeEach(() => {
	db = createDb();
});

afterEach(() => {
	db.close();
});

describe("insertPhaseAt", () => {
	it("inserts at the beginning and shifts existing phases", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1", "taskB2"]);

		insertPhaseAt(db, 1, 0, "New First", ["newTask"], null, undefined);

		const phases = getPhases(db);
		expect(phases).toEqual([
			{ idx: 0, name: "New First" },
			{ idx: 1, name: "Phase A" },
			{ idx: 2, name: "Phase B" },
		]);

		const tasks = getTasks(db);
		expect(tasks).toEqual([
			{ phase_idx: 0, idx: 0, task: "newTask" },
			{ phase_idx: 1, idx: 0, task: "taskA1" },
			{ phase_idx: 2, idx: 0, task: "taskB1" },
			{ phase_idx: 2, idx: 1, task: "taskB2" },
		]);
	});

	it("inserts in the middle", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1"]);
		seedPhase(db, 2, "Phase C", ["taskC1"]);

		insertPhaseAt(db, 1, 1, "Middle", ["midTask"], null, undefined);

		const phases = getPhases(db);
		expect(phases).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Middle" },
			{ idx: 2, name: "Phase B" },
			{ idx: 3, name: "Phase C" },
		]);
	});

	it("inserts at the end (append)", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1"]);

		insertPhaseAt(db, 1, 2, "Appended", ["endTask"], null, undefined);

		const phases = getPhases(db);
		expect(phases).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
			{ idx: 2, name: "Appended" },
		]);
	});

	it("stores manual checks on the new phase", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);

		const checks = JSON.stringify(["check1", "check2"]);
		insertPhaseAt(db, 1, 0, "Checked", ["t1"], checks, undefined);

		const row = db
			.prepare(
				"SELECT manual_checks FROM plan_phases WHERE item_id = 1 AND idx = 0",
			)
			.get() as { manual_checks: string | null };
		expect(JSON.parse(row.manual_checks ?? "null")).toEqual([
			"check1",
			"check2",
		]);
	});

	describe("currentPhase adjustment", () => {
		it("increments currentPhase when inserting at its position", () => {
			seedItem(db, 2);
			seedPhase(db, 0, "A", ["t"]);
			seedPhase(db, 1, "B", ["t"]);
			seedPhase(db, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 1 pushes it down
			insertPhaseAt(db, 1, 1, "New", ["t"], null, 2);

			expect(getCurrentPhase(db)).toBe(3);
		});

		it("does not adjust currentPhase when inserting just past it", () => {
			seedItem(db, 2);
			seedPhase(db, 0, "A", ["t"]);
			seedPhase(db, 1, "B", ["t"]);
			seedPhase(db, 2, "C", ["t"]);

			// currentPhase 2 (1-based) = index 1; inserting at index 2 is after it
			insertPhaseAt(db, 1, 2, "New", ["t"], null, 2);

			expect(getCurrentPhase(db)).toBe(2);
		});

		it("does not adjust currentPhase when inserting well after it", () => {
			seedItem(db, 1);
			seedPhase(db, 0, "A", ["t"]);
			seedPhase(db, 1, "B", ["t"]);

			insertPhaseAt(db, 1, 2, "New", ["t"], null, 1);

			expect(getCurrentPhase(db)).toBe(1);
		});

		it("does not adjust when currentPhase is undefined", () => {
			seedItem(db);
			seedPhase(db, 0, "A", ["t"]);

			insertPhaseAt(db, 1, 0, "New", ["t"], null, undefined);

			expect(getCurrentPhase(db)).toBeNull();
		});
	});
});
