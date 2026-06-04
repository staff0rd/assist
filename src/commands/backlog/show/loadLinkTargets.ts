import { inArray } from "drizzle-orm";
import type { BacklogOrm } from "../BacklogOrm";
import { items } from "../backlogSchema";
import type { BacklogItem, BacklogStatus } from "../types";

/** The fields {@link ./printLinks} needs to render a linked item. */
type ItemRef = Pick<BacklogItem, "id" | "name" | "status">;

/**
 * Fetch just the id, name, and status of the given link target ids in one
 * query, so `show` can render link labels without loading the whole backlog.
 */
export async function loadLinkTargets(
	orm: BacklogOrm,
	ids: number[],
): Promise<ItemRef[]> {
	if (ids.length === 0) return [];
	const rows = await orm
		.select({ id: items.id, name: items.name, status: items.status })
		.from(items)
		.where(inArray(items.id, ids));
	return rows.map((r) => ({
		id: r.id,
		name: r.name,
		status: r.status as BacklogStatus,
	}));
}
