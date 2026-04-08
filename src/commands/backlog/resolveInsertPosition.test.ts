import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveInsertPosition } from "./resolveInsertPosition";

function createDb(): ReturnType<typeof Database> {
	const db = new Database(":memory:");
	db.exec(`
		CREATE TABLE items (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'todo'
		);
		CREATE TABLE plan_phases (
			item_id INTEGER NOT NULL REFERENCES items(id),
			idx INTEGER NOT NULL,
			name TEXT NOT NULL,
			PRIMARY KEY (item_id, idx)
		);
	`);
	return db;
}

let db: ReturnType<typeof Database>;

beforeEach(() => {
	db = createDb();
	db.prepare("INSERT INTO items (id, name) VALUES (1, 'Test')").run();
	db.prepare(
		"INSERT INTO plan_phases (item_id, idx, name) VALUES (1, 0, 'A'), (1, 1, 'B'), (1, 2, 'C')",
	).run();
	process.exitCode = undefined;
});

afterEach(() => {
	db.close();
	process.exitCode = undefined;
});

describe("resolveInsertPosition", () => {
	it("returns phaseCount when position is undefined (append)", () => {
		expect(resolveInsertPosition(db, 1, undefined)).toBe(3);
	});

	it("converts 1-based position to 0-based index", () => {
		expect(resolveInsertPosition(db, 1, "1")).toBe(0);
		expect(resolveInsertPosition(db, 1, "2")).toBe(1);
		expect(resolveInsertPosition(db, 1, "3")).toBe(2);
	});

	it("accepts position equal to phaseCount + 1 (append)", () => {
		expect(resolveInsertPosition(db, 1, "4")).toBe(3);
	});

	it("rejects position less than 1", () => {
		expect(resolveInsertPosition(db, 1, "0")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});

	it("rejects position greater than phaseCount + 1", () => {
		expect(resolveInsertPosition(db, 1, "5")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});
});
