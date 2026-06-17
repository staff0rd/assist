import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { links } from "../../shared/db/schema";

/**
 * Load the `depends-on` dependency graph as an adjacency map (item id → the ids
 * it depends on) in one targeted query. Used for cycle detection in {@link ./link}
 * without loading every item and all of its relations.
 */
export async function loadDependencyGraph(
	orm: Db,
): Promise<Map<number, number[]>> {
	const rows = await orm
		.select({ itemId: links.itemId, targetId: links.targetId })
		.from(links)
		.where(eq(links.type, "depends-on"));
	const graph = new Map<number, number[]>();
	for (const { itemId, targetId } of rows) {
		const bucket = graph.get(itemId);
		if (bucket) bucket.push(targetId);
		else graph.set(itemId, [targetId]);
	}
	return graph;
}
