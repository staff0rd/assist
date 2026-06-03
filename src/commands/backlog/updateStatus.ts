import { eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items } from "./backlogSchema";
import type { BacklogStatus } from "./types";

/**
 * Set an item's status with a single targeted write. Returns the item's name, or
 * `undefined` if no item with that id exists.
 */
export async function updateStatus(
	orm: BacklogOrm,
	id: number,
	status: BacklogStatus,
): Promise<string | undefined> {
	const [row] = await orm
		.update(items)
		.set({ status })
		.where(eq(items.id, id))
		.returning({ name: items.name });
	return row?.name;
}
