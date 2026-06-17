import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listPendingHandovers } from "./listPendingHandovers";
import { recallHandover } from "./recallHandover";
import { saveHandover } from "./saveHandover";

const ORIGIN = "github.com/acme/repo";

describe("listPendingHandovers", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("lists unrecalled notes for the origin, most recent first", async () => {
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "older",
			content: "first",
			createdAt: new Date("2026-01-01T00:00:00Z"),
		});
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "newer",
			content: "second",
			createdAt: new Date("2026-02-01T00:00:00Z"),
		});

		const rows = await listPendingHandovers(orm, ORIGIN);
		expect(rows.map((r) => r.summary)).toEqual(["newer", "older"]);
	});

	it("omits recalled notes and scopes by origin", async () => {
		await saveHandover(orm, { origin: ORIGIN, summary: "mine", content: "a" });
		await saveHandover(orm, {
			origin: "github.com/other/repo",
			summary: "theirs",
			content: "b",
		});

		await recallHandover(orm, ORIGIN);
		expect(await listPendingHandovers(orm, ORIGIN)).toEqual([]);
	});
});

describe("recallHandover by id", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("recalls the note with the given id, not the most recent", async () => {
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "older",
			content: "first",
			createdAt: new Date("2026-01-01T00:00:00Z"),
		});
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "newer",
			content: "second",
			createdAt: new Date("2026-02-01T00:00:00Z"),
		});

		const older = (await listPendingHandovers(orm, ORIGIN)).find(
			(r) => r.summary === "older",
		);
		if (!older) throw new Error("expected older note");
		const content = await recallHandover(orm, ORIGIN, older.id);
		expect(content).toBe("first");

		const remaining = await listPendingHandovers(orm, ORIGIN);
		expect(remaining.map((r) => r.summary)).toEqual(["newer"]);
	});

	it("returns undefined for an id that is not an unrecalled note", async () => {
		await saveHandover(orm, { origin: ORIGIN, summary: "s", content: "c" });
		expect(await recallHandover(orm, ORIGIN, 9999)).toBeUndefined();
	});
});
