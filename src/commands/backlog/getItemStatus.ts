import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import type { BacklogStatus } from "./types";

/**
 * Read a single item's status in one targeted query, or `undefined` if no item
 * with that id exists. Avoids loading the whole backlog just to branch on status.
 */
export async function getItemStatus(
	orm: Db,
	id: number,
): Promise<BacklogStatus | undefined> {
	const [row] = await orm
		.select({ status: items.status })
		.from(items)
		.where(eq(items.id, id));
	return row?.status as BacklogStatus | undefined;
}
