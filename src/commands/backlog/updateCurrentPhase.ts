import { eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items } from "./backlogSchema";

/** Set an item's current phase with a single targeted write. */
export async function updateCurrentPhase(
	orm: BacklogOrm,
	id: number,
	phase: number,
): Promise<void> {
	await orm.update(items).set({ currentPhase: phase }).where(eq(items.id, id));
}
