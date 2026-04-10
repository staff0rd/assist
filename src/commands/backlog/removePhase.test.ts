import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { adjustCurrentPhase, reindexPhases } from "./findPhase";

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

let db: ReturnType<typeof Database>;

beforeEach(() => {
	db = createDb();
});

afterEach(() => {
	db.close();
});

function removePhaseInTransaction(
	db: ReturnType<typeof Database>,
	itemId: number,
	phaseIdx: number,
	currentPhase?: number,
): void {
	const run = db.transaction(() => {
		db.prepare(
			"DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?",
		).run(itemId, phaseIdx);
		db.prepare("DELETE FROM plan_phases WHERE item_id = ? AND idx = ?").run(
			itemId,
			phaseIdx,
		);
		reindexPhases(db, itemId);
		if (currentPhase !== undefined) {
			adjustCurrentPhase(db, { id: itemId, currentPhase } as never, phaseIdx);
		}
	});
	run();
}

describe("removePhase reindexing", () => {
	it("removes a middle phase and reindexes without FK errors", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1"]);
		seedPhase(db, 2, "Phase C", ["taskC1", "taskC2"]);

		removePhaseInTransaction(db, 1, 1);

		expect(getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
			{ phase_idx: 1, idx: 1, task: "taskC2" },
		]);
	});

	it("removes the first phase and reindexes", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1"]);
		seedPhase(db, 2, "Phase C", ["taskC1"]);

		removePhaseInTransaction(db, 1, 0);

		expect(getPhases(db)).toEqual([
			{ idx: 0, name: "Phase B" },
			{ idx: 1, name: "Phase C" },
		]);
		expect(getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskB1" },
			{ phase_idx: 1, idx: 0, task: "taskC1" },
		]);
	});

	it("removes the last phase without needing reindex", () => {
		seedItem(db);
		seedPhase(db, 0, "Phase A", ["taskA1"]);
		seedPhase(db, 1, "Phase B", ["taskB1"]);
		seedPhase(db, 2, "Phase C", ["taskC1"]);

		removePhaseInTransaction(db, 1, 2);

		expect(getPhases(db)).toEqual([
			{ idx: 0, name: "Phase A" },
			{ idx: 1, name: "Phase B" },
		]);
		expect(getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "taskA1" },
			{ phase_idx: 1, idx: 0, task: "taskB1" },
		]);
	});

	it("removes phase 2 of 4 and reindexes the rest", () => {
		seedItem(db);
		seedPhase(db, 0, "A", ["a1"]);
		seedPhase(db, 1, "B", ["b1"]);
		seedPhase(db, 2, "C", ["c1"]);
		seedPhase(db, 3, "D", ["d1"]);

		removePhaseInTransaction(db, 1, 1);

		expect(getPhases(db)).toEqual([
			{ idx: 0, name: "A" },
			{ idx: 1, name: "C" },
			{ idx: 2, name: "D" },
		]);
		expect(getTasks(db)).toEqual([
			{ phase_idx: 0, idx: 0, task: "a1" },
			{ phase_idx: 1, idx: 0, task: "c1" },
			{ phase_idx: 2, idx: 0, task: "d1" },
		]);
	});
});
