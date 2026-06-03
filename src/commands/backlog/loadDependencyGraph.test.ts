import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogOrm } from "./BacklogOrm";
import { items, links } from "./backlogSchema";
import { createTestDb } from "./createTestDb";
import { hasCycle } from "./hasCycle";
import { loadDependencyGraph } from "./loadDependencyGraph";

let orm: BacklogOrm;
let close: () => Promise<void>;

async function seedItem(id: number): Promise<void> {
	await orm
		.insert(items)
		.values({ id, origin: "test", name: "Item", status: "todo" });
}

async function seedLink(from: number, to: number, type: string): Promise<void> {
	await orm.insert(links).values({ itemId: from, type, targetId: to });
}

describe("loadDependencyGraph", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		for (const id of [1, 2, 3]) await seedItem(id);
	});

	afterEach(async () => {
		await close();
	});

	it("includes only depends-on edges", async () => {
		await seedLink(1, 2, "depends-on");
		await seedLink(2, 3, "relates-to");

		const graph = await loadDependencyGraph(orm);

		expect(graph.get(1)).toEqual([2]);
		expect(graph.get(2)).toBeUndefined();
	});

	it("supports cycle detection via hasCycle", async () => {
		// 2 depends-on 1 already; linking 1 depends-on 2 would close the loop.
		await seedLink(2, 1, "depends-on");

		const graph = await loadDependencyGraph(orm);

		expect(hasCycle(graph, 1, 2)).toBe(true);
		expect(hasCycle(graph, 1, 3)).toBe(false);
	});
});
