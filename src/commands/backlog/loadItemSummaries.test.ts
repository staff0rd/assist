import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import {
	comments,
	items,
	itemSubtasks,
	links,
	phaseUsage,
	planPhases,
	planTasks,
} from "../../shared/db/schema";
import { loadItemSummaries } from "./loadItemSummaries";

let orm: Db;
let close: () => Promise<void>;

describe("loadItemSummaries", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("returns an empty list when there are no items", async () => {
		expect(await loadItemSummaries(orm)).toEqual([]);
	});

	it("returns only summary columns and never loads relations", async () => {
		await orm.insert(items).values({
			id: 1,
			origin: "test",
			type: "bug",
			name: "Test",
			description: "secret description",
			acceptanceCriteria: '["AC1"]',
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

		const [summary] = await loadItemSummaries(orm);

		expect(summary).toEqual({
			id: 1,
			origin: "test",
			type: "bug",
			name: "Test",
			status: "in-progress",
			starred: false,
			incompleteSubtasks: 0,
		});
	});

	it("counts only sub-tasks whose status is not done", async () => {
		await orm
			.insert(items)
			.values({ id: 1, origin: "test", name: "One", status: "todo" });
		await orm
			.insert(items)
			.values({ id: 2, origin: "test", name: "Two", status: "todo" });
		await orm.insert(itemSubtasks).values([
			{ itemId: 1, idx: 0, title: "a", status: "todo" },
			{ itemId: 1, idx: 1, title: "b", status: "in-progress" },
			{ itemId: 1, idx: 2, title: "c", status: "done" },
			{ itemId: 2, idx: 0, title: "d", status: "done" },
		]);

		const summaries = await loadItemSummaries(orm);

		expect(summaries.find((s) => s.id === 1)?.incompleteSubtasks).toBe(2);
		expect(summaries.find((s) => s.id === 2)?.incompleteSubtasks).toBe(0);
	});

	it("sums phase usage into an item-level total, or omits it when absent", async () => {
		await orm
			.insert(items)
			.values({ id: 1, origin: "test", name: "With usage", status: "todo" });
		await orm
			.insert(items)
			.values({ id: 2, origin: "test", name: "No usage", status: "todo" });
		await orm.insert(phaseUsage).values([
			{
				itemId: 1,
				phaseIdx: 0,
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
			},
			{ itemId: 1, phaseIdx: 1, tokensUp: 50, tokensDown: 25, activeMs: 1000 },
		]);

		const summaries = await loadItemSummaries(orm);

		expect(summaries.find((s) => s.id === 1)?.usageTotal).toEqual({
			tokensUp: 150,
			tokensDown: 225,
			activeMs: 6000,
		});
		expect(summaries.find((s) => s.id === 2)?.usageTotal).toBeUndefined();
	});

	it("scopes to the given origin", async () => {
		await orm
			.insert(items)
			.values({ id: 1, origin: "a", name: "One", status: "todo" });
		await orm
			.insert(items)
			.values({ id: 2, origin: "b", name: "Two", status: "todo" });

		const summaries = await loadItemSummaries(orm, "a");

		expect(summaries.map((s) => s.id)).toEqual([1]);
	});
});
