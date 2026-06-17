import type { BacklogDatabase } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { itemColumns } from "./itemColumns";
import type { BacklogItem } from "./types";

type NewBacklogItem = Omit<BacklogItem, "id">;

/**
 * Insert a brand-new item, tagging it with `origin` and letting the database
 * assign a globally-unique auto-increment id. Returns the new id.
 */
export async function insertItem(
	db: BacklogDatabase,
	item: NewBacklogItem,
	origin: string,
): Promise<number> {
	const [row] = await db
		.insert(items)
		.values(itemColumns(item, origin))
		.returning({ id: items.id });
	if (!row) throw new Error("Failed to insert backlog item");
	return row.id;
}
