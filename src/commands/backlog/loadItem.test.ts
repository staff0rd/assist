import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import {
	comments,
	items,
	links,
	phaseUsage,
	planPhases,
	planTasks,
} from "../../shared/db/schema";
import { loadItem } from "./loadItem";

let orm: Db;
let close: () => Promise<void>;

describe("loadItem", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("returns undefined for a missing item", async () => {
		expect(await loadItem(orm, 99)).toBeUndefined();
	});

	it("loads an item with its relations", async () => {
		await orm.insert(items).values({
			id: 1,
			origin: "test",
			name: "Test",
			status: "in-progress",
			currentPhase: 2,
		});
		await orm.insert(comments).values({
			itemId: 1,
			idx: 0,
			text: "Hi",
			timestamp: "t",
			type: "comment",
		});
		await orm
			.insert(links)
			.values({ itemId: 1, type: "relates-to", targetId: 5 });
		await orm.insert(planPhases).values({ itemId: 1, idx: 0, name: "Setup" });
		await orm
			.insert(planTasks)
			.values({ itemId: 1, phaseIdx: 0, idx: 0, task: "Do it" });

		const item = await loadItem(orm, 1);

		expect(item).toMatchObject({
			id: 1,
			name: "Test",
			status: "in-progress",
			currentPhase: 2,
			comments: [{ text: "Hi", type: "comment" }],
			links: [{ type: "relates-to", targetId: 5 }],
			plan: [{ name: "Setup", tasks: [{ task: "Do it" }] }],
		});
	});

	it("sums phase usage into an item-level total", async () => {
		await orm
			.insert(items)
			.values({ id: 1, origin: "test", name: "Test", status: "in-progress" });
		await orm.insert(phaseUsage).values([
			{
				itemId: 1,
				phaseIdx: 0,
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 45,
			},
			{
				itemId: 1,
				phaseIdx: 1,
				tokensUp: 50,
				tokensDown: 25,
				activeMs: 1000,
				peakContextPct: 72,
			},
		]);

		const item = await loadItem(orm, 1);

		expect(item?.usageTotal).toEqual({
			tokensUp: 150,
			tokensDown: 225,
			activeMs: 6000,
			peakContextPct: 72,
		});
	});
});
