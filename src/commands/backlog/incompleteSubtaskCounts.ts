import { ne, sql } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { itemSubtasks } from "../../shared/db/schema";

export function incompleteSubtaskCounts(orm: Db) {
	return orm
		.select({
			itemId: itemSubtasks.itemId,
			count: sql<number>`count(*)::int`.as("incomplete_subtasks"),
		})
		.from(itemSubtasks)
		.where(ne(itemSubtasks.status, "done"))
		.groupBy(itemSubtasks.itemId)
		.as("incomplete_counts");
}
