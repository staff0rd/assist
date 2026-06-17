import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";

/** Set an item's current phase with a single targeted write. */
export async function updateCurrentPhase(
	orm: Db,
	id: number,
	phase: number,
): Promise<void> {
	await orm.update(items).set({ currentPhase: phase }).where(eq(items.id, id));
}
