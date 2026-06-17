import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";

/**
 * Set an item's starred flag with a single targeted write. Returns the item's
 * name, or `undefined` if no item with that id exists.
 */
export async function updateStarred(
	orm: Db,
	id: number,
	starred: boolean,
): Promise<string | undefined> {
	const [row] = await orm
		.update(items)
		.set({ starred })
		.where(eq(items.id, id))
		.returning({ name: items.name });
	return row?.name;
}
