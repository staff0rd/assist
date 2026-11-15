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
			currentPhase: 2,
			totalPhases: 2,
		});
	});

	it("lists the phases running in parallel and done ahead of currentPhase", async () => {
		await orm.insert(items).values({
			id: 1,
			origin: "test",
			name: "Parallel",
			status: "in-progress",
			currentPhase: 2,
		});
		await orm.insert(planPhases).values([
			{ itemId: 1, idx: 0, name: "One", runState: "done" },
			{ itemId: 1, idx: 1, name: "Two", runState: "running" },
			{ itemId: 1, idx: 2, name: "Three", runState: "done" },
			{ itemId: 1, idx: 3, name: "Four", runState: "running" },
		]);

		const [summary] = await loadItemSummaries(orm);

		expect(summary.runningPhases).toEqual([2, 4]);
		expect(summary.donePhases).toEqual([1, 3]);
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

		const summaries = await loadItemSummaries(orm);

		expect(summaries.find((s) => s.id === 1)?.usageTotal).toEqual({
			tokensUp: 150,
			tokensDown: 225,
			activeMs: 6000,
			peakContextPct: 72,
		});
		expect(summaries.find((s) => s.id === 2)?.usageTotal).toBeUndefined();
	});

	it("counts total phases as authored plan length + 1, defaulting plan-less items to 2", async () => {
		await orm.insert(items).values({
			id: 1,
			origin: "test",
			name: "Planned",
			status: "in-progress",
			currentPhase: 2,
		});
		await orm.insert(items).values({
			id: 2,
			origin: "test",
			name: "Plan-less",
			status: "in-progress",
			currentPhase: 1,
		});
		await orm.insert(planPhases).values([
			{ itemId: 1, idx: 0, name: "One" },
			{ itemId: 1, idx: 1, name: "Two" },
			{ itemId: 1, idx: 2, name: "Three" },
		]);

		const summaries = await loadItemSummaries(orm);

		const planned = summaries.find((s) => s.id === 1);
		expect(planned?.currentPhase).toBe(2);
		expect(planned?.totalPhases).toBe(4);
		const planless = summaries.find((s) => s.id === 2);
		expect(planless?.currentPhase).toBe(1);
		expect(planless?.totalPhases).toBe(2);
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
