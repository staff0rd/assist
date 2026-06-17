import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";

/**
 * Delete an item with a single targeted write; its relations are removed by the
 * `ON DELETE CASCADE` foreign keys (see {@link ./ensureSchema}). Returns the
 * deleted item's name, or `undefined` if no item with that id existed.
 */
export async function deleteItem(
	orm: Db,
	id: number,
): Promise<string | undefined> {
	const [row] = await orm
		.delete(items)
		.where(eq(items.id, id))
		.returning({ name: items.name });
	return row?.name;
}
