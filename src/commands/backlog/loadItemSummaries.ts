import { asc, eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items } from "./backlogSchema";
import type { BacklogItemSummary, BacklogStatus, BacklogType } from "./types";

/**
 * Load lightweight summaries for the backlog list: only the columns the list
 * renders (id, origin, type, name, status). Unlike {@link ./loadAllItems} this
 * never touches the relation tables — descriptions, acceptance criteria,
 * comments, links, phases and tasks are fetched on demand by {@link ./loadItem}
 * when a single item is opened, keeping the index fast for large backlogs.
 */
export async function loadItemSummaries(
	orm: BacklogOrm,
	origin?: string,
): Promise<BacklogItemSummary[]> {
	const rows = await orm
		.select({
			id: items.id,
			origin: items.origin,
			type: items.type,
			name: items.name,
			status: items.status,
			starred: items.starred,
		})
		.from(items)
		.where(origin === undefined ? undefined : eq(items.origin, origin))
		.orderBy(asc(items.id));
	return rows.map((row) => ({
		id: row.id,
		origin: row.origin,
		type: row.type as BacklogType,
		name: row.name,
		status: row.status as BacklogStatus,
		starred: row.starred,
	}));
}
