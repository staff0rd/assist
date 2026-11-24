import { sql } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";

/**
 * Retag every item of `fromOrigin` to `toOrigin`, placing them at the bottom of
 * the destination's order while keeping their relative order.
 */
export async function appendItemsToOrigin(
	db: BacklogDatabase,
	fromOrigin: string,
	toOrigin: string,
): Promise<void> {
	await db.execute(sql`
		UPDATE items i
		SET origin = ${toOrigin}, priority = r.priority
		FROM (
			SELECT id, nextval('items_priority_seq') AS priority
			FROM (
				SELECT id FROM items
				WHERE origin = ${fromOrigin}
				ORDER BY priority, id
			) ordered
		) r
		WHERE i.id = r.id
	`);
}
