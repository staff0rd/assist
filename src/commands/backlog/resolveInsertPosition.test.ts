import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases } from "../../shared/db/schema";
import { resolveInsertPosition } from "./resolveInsertPosition";

let orm: Db;
let close: () => Promise<void>;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	await orm.insert(items).values({ id: 1, origin: "test", name: "Test" });
	await orm.insert(planPhases).values([
		{ itemId: 1, idx: 0, name: "A" },
		{ itemId: 1, idx: 1, name: "B" },
		{ itemId: 1, idx: 2, name: "C" },
	]);
	process.exitCode = undefined;
});

afterEach(async () => {
	await close();
	process.exitCode = undefined;
});

describe("resolveInsertPosition", () => {
	it("returns phaseCount when position is undefined (append)", async () => {
		expect(await resolveInsertPosition(orm, 1, undefined)).toBe(3);
	});

	it("converts 1-based position to 0-based index", async () => {
		expect(await resolveInsertPosition(orm, 1, "1")).toBe(0);
		expect(await resolveInsertPosition(orm, 1, "2")).toBe(1);
		expect(await resolveInsertPosition(orm, 1, "3")).toBe(2);
	});

	it("accepts position equal to phaseCount + 1 (append)", async () => {
		expect(await resolveInsertPosition(orm, 1, "4")).toBe(3);
	});

	it("rejects position less than 1", async () => {
		expect(await resolveInsertPosition(orm, 1, "0")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});

	it("rejects position greater than phaseCount + 1", async () => {
		expect(await resolveInsertPosition(orm, 1, "5")).toBeUndefined();
		expect(process.exitCode).toBe(1);
	});
});
