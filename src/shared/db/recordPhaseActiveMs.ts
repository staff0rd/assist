import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

/**
 * Add a completed running interval's duration to a phase's active time. Creates
 * the row (with a zero token baseline) if the phase has no usage recorded yet,
 * otherwise sums onto the existing `activeMs` without touching the token totals.
 */
export async function recordPhaseActiveMs(
	db: Db,
	itemId: number,
	phaseIdx: number,
	activeMs: number,
): Promise<void> {
	if (activeMs <= 0) return;
	await db
		.insert(phaseUsage)
		.values({ itemId, phaseIdx, activeMs })
		.onConflictDoUpdate({
			target: [phaseUsage.itemId, phaseUsage.phaseIdx],
			set: {
				activeMs: sql`${phaseUsage.activeMs} + excluded.active_ms`,
			},
		});
}
