import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogOrm } from "./BacklogOrm";
import { comments, items, links, planPhases, planTasks } from "./backlogSchema";
import { createTestDb } from "./createTestDb";
import { loadItem } from "./loadItem";

let orm: BacklogOrm;
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
});
