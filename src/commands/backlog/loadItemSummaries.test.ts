import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogOrm } from "./BacklogOrm";
import { comments, items, links, planPhases, planTasks } from "./backlogSchema";
import { createTestDb } from "./createTestDb";
import { loadItemSummaries } from "./loadItemSummaries";

let orm: BacklogOrm;
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
		});
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
