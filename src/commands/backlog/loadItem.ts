import { eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items } from "./backlogSchema";
import { loadRelations } from "./loadRelations";
import { rowToItem } from "./rowToItem";
import type { BacklogItem } from "./types";

/**
 * Load a single item and its relations, or `undefined` if it does not exist.
 * Relations are fetched with the same batched queries as {@link ./loadAllItems},
 * scoped to this one id — a fixed handful of round-trips, never the whole backlog.
 */
export async function loadItem(
	orm: BacklogOrm,
	id: number,
): Promise<BacklogItem | undefined> {
	const [row] = await orm.select().from(items).where(eq(items.id, id));
	if (!row) return undefined;
	const rel = await loadRelations(orm, [id]);
	return rowToItem(row, rel);
}
