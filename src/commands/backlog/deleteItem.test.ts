import { count, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import {
	comments,
	items,
	links,
	planPhases,
	planTasks,
} from "../../shared/db/schema";
import { deleteItem } from "./deleteItem";

let orm: Db;
let close: () => Promise<void>;

async function countRel(
	table: PgTable & { itemId: PgColumn },
): Promise<number> {
	const [row] = await orm
		.select({ n: count() })
		.from(table)
		.where(eq(table.itemId, 1));
	return row.n;
}

describe("deleteItem", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm
			.insert(items)
			.values({ id: 1, origin: "test", name: "Test", status: "todo" });
		await orm.insert(comments).values({
			itemId: 1,
			idx: 0,
			text: "c",
			timestamp: "t",
			type: "comment",
		});
		await orm
			.insert(links)
			.values({ itemId: 1, type: "relates-to", targetId: 9 });
		await orm.insert(planPhases).values({ itemId: 1, idx: 0, name: "P" });
		await orm
			.insert(planTasks)
			.values({ itemId: 1, phaseIdx: 0, idx: 0, task: "T" });
	});

	afterEach(async () => {
		await close();
	});

	it("returns the deleted item's name", async () => {
		expect(await deleteItem(orm, 1)).toBe("Test");
	});

	it("returns undefined for a missing item", async () => {
		expect(await deleteItem(orm, 99)).toBeUndefined();
	});

	it("cascades to comments, links, phases and tasks", async () => {
		await deleteItem(orm, 1);

		expect(await countRel(comments)).toBe(0);
		expect(await countRel(links)).toBe(0);
		expect(await countRel(planPhases)).toBe(0);
		expect(await countRel(planTasks)).toBe(0);
	});
});
