import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { loadAllItems } from "./loadAllItems";
import { loadItemSummaries } from "./loadItemSummaries";
import { reorderItem } from "./reorderItem";

const A = "github.com/acme/a";
const B = "github.com/acme/b";

let orm: Db;
let close: () => Promise<void>;

const order = async (origin = A) =>
	(await loadAllItems(orm, origin)).map((i) => i.id);

describe("reorderItem", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		for (const [id, origin] of [
			[1, A],
			[2, A],
			[3, B],
			[4, A],
			[5, B],
			[6, A],
		] as const) {
			await orm.insert(items).values({ id, origin, name: `Item ${id}` });
		}
	});

	afterEach(async () => {
		await close();
	});

	it("lists new items in creation order", async () => {
		expect(await order()).toEqual([1, 2, 4, 6]);
		expect(await order(B)).toEqual([3, 5]);
	});

	it("moves an item before a target", async () => {
		expect(
			await reorderItem(orm, 6, { side: "before", targetId: 2 }),
		).toBeUndefined();

		expect(await order()).toEqual([1, 6, 2, 4]);
	});

	it("moves an item after a target", async () => {
		await reorderItem(orm, 1, { side: "after", targetId: 4 });

		expect(await order()).toEqual([2, 4, 1, 6]);
	});

	it("moves an item to the top and the bottom", async () => {
		await reorderItem(orm, 4, { edge: "top" });
		expect(await order()).toEqual([4, 1, 2, 6]);

		await reorderItem(orm, 1, { edge: "bottom" });
		expect(await order()).toEqual([4, 2, 6, 1]);
	});

	it("keeps the order across successive moves", async () => {
		await reorderItem(orm, 6, { edge: "top" });
		await reorderItem(orm, 1, { side: "after", targetId: 2 });
		await reorderItem(orm, 4, { side: "before", targetId: 6 });

		expect(await order()).toEqual([4, 6, 2, 1]);
	});

	it("sorts summaries by priority too", async () => {
		await reorderItem(orm, 6, { edge: "top" });

		expect((await loadItemSummaries(orm, A)).map((i) => i.id)).toEqual([
			6, 1, 2, 4,
		]);
	});

	it("leaves other repos' order unchanged", async () => {
		const before = await orm
			.select({ id: items.id, priority: items.priority })
			.from(items);
		await reorderItem(orm, 6, { edge: "top" });
		const after = await orm
			.select({ id: items.id, priority: items.priority })
			.from(items);

		const priorityOf = (rows: typeof before, id: number) =>
			rows.find((r) => r.id === id)?.priority;
		expect(priorityOf(after, 3)).toBe(priorityOf(before, 3));
		expect(priorityOf(after, 5)).toBe(priorityOf(before, 5));
	});

	it("refuses a target in another repo", async () => {
		const error = await reorderItem(orm, 1, { side: "before", targetId: 3 });

		expect(error).toContain("a3 belongs to github.com/acme/b");
		expect(await order()).toEqual([1, 2, 4, 6]);
	});

	it("refuses a missing item or target, or the item itself", async () => {
		expect(await reorderItem(orm, 99, { edge: "top" })).toBe(
			"Item a99 not found.",
		);
		expect(await reorderItem(orm, 1, { side: "after", targetId: 99 })).toBe(
			"Item a99 not found.",
		);
		expect(await reorderItem(orm, 1, { side: "after", targetId: 1 })).toContain(
			"relative to itself",
		);
	});

	it("puts an item created after a move at the bottom", async () => {
		await reorderItem(orm, 1, { edge: "bottom" });
		await orm.insert(items).values({ id: 7, origin: A, name: "Item 7" });

		expect(await order()).toEqual([2, 4, 6, 1, 7]);
	});
});
