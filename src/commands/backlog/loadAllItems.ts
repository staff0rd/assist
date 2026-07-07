import { asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { loadRelations } from "./loadRelations";
import { rowToItem } from "./rowToItem";
import type { BacklogFile } from "./types";

/**
 * Load all backlog items. When `origin` is provided, only items tagged with that
 * origin are returned; when omitted, items across every repository are returned.
 *
 * Relations are loaded in batched queries (see {@link loadRelations}) rather than
 * per-item, avoiding the N+1 round-trips that made this slow against remote
 * Postgres. Comments and tasks are skipped: the whole-backlog callers (list,
 * next, search, migrate) only read item columns, links and phase names — full
 * relations load on demand via {@link ./loadItem} when a single item is opened.
 */
export async function loadAllItems(
	orm: Db,
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
		{ includeComments: false, includeTasks: false, includeSubtasks: false },
	);
	return rows.map((row) => rowToItem(row, rel));
}
