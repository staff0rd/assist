import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogDb } from "./BacklogDb";
import { createTestDb } from "./createTestDb";
import { resolveInsertPosition } from "./resolveInsertPosition";

let db: BacklogDb;
let close: () => Promise<void>;

beforeEach(async () => {
	({ db, close } = await createTestDb());
	await db.run(
		"INSERT INTO items (id, origin, name) VALUES (1, 'test', 'Test')",
	);
	await db.run(
		"INSERT INTO plan_phases (item_id, idx, name) VALUES (1, 0, 'A'), (1, 1, 'B'), (1, 2, 'C')",
	);
	process.exitCode = undefined;
});

afterEach(async () => {
	await close();
	process.exitCode = undefined;
});

describe("resolveInsertPosition", () => {
	it("returns phaseCount when position is undefined (append)", async () => {
		expect(await resolveInsertPosition(db, 1, undefined)).toBe(3);
	});

	it("converts 1-based position to 0-based index", async () => {
		expect(await resolveInsertPosition(db, 1, "1")).toBe(0);
		expect(await resolveInsertPosition(db, 1, "2")).toBe(1);
		expect(await resolveInsertPosition(db, 1, "3")).toBe(2);
	});

	it("accepts position equal to phaseCount + 1 (append)", async () => {
		expect(await resolveInsertPosition(db, 1, "4")).toBe(3);
	});

	it("rejects position less than 1", async () => {
		expect(await resolveInsertPosition(db, 1, "0")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});

	it("rejects position greater than phaseCount + 1", async () => {
		expect(await resolveInsertPosition(db, 1, "5")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});
});
