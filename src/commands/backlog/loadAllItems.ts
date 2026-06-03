import { asc, eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items } from "./backlogSchema";
import { loadRelations } from "./loadRelations";
import { rowToItem } from "./rowToItem";
import type { BacklogFile } from "./types";

/**
 * Load all backlog items. When `origin` is provided, only items tagged with that
 * origin are returned; when omitted, items across every repository are returned.
 *
 * Relations are loaded in batched queries (see {@link loadRelations}) rather than
 * per-item, avoiding the N+1 round-trips that made this slow against remote
 * Postgres.
 */
export async function loadAllItems(
	orm: BacklogOrm,
	origin?: string,
): Promise<BacklogFile> {
	const rows = await orm
		.select()
		.from(items)
		.where(origin === undefined ? undefined : eq(items.origin, origin))
		.orderBy(asc(items.id));
	if (rows.length === 0) return [];

	const rel = await loadRelations(
		orm,
		rows.map((r) => r.id),
	);
	return rows.map((row) => rowToItem(row, rel));
}
