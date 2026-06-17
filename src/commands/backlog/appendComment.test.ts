import { asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { comments, items } from "../../shared/db/schema";
import { appendComment } from "./appendComment";

let orm: Db;
let close: () => Promise<void>;

async function seedItem(): Promise<void> {
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Test", status: "in-progress" });
}

function getComments(): Promise<
	{ idx: number; text: string; phase: number | null; type: string }[]
> {
	return orm
		.select({
			idx: comments.idx,
			text: comments.text,
			phase: comments.phase,
			type: comments.type,
		})
		.from(comments)
		.where(eq(comments.itemId, 1))
		.orderBy(asc(comments.idx));
}

describe("appendComment", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await seedItem();
	});

	afterEach(async () => {
		await close();
	});

	it("assigns idx 0 to the first comment", async () => {
		await appendComment(orm, 1, "First");

		const rows = await getComments();
		expect(rows).toEqual([
			{ idx: 0, text: "First", phase: null, type: "comment" },
		]);
	});

	it("increments idx for each appended comment", async () => {
		await appendComment(orm, 1, "First");
		await appendComment(orm, 1, "Second", { phase: 2, type: "summary" });
		await appendComment(orm, 1, "Third");

		const rows = await getComments();
		expect(rows.map((r) => r.idx)).toEqual([0, 1, 2]);
		expect(rows[1]).toEqual({
			idx: 1,
			text: "Second",
			phase: 2,
			type: "summary",
		});
	});
});
