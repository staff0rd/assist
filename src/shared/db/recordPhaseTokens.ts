import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

/**
 * Accumulate a phase's token spend from the status line's context-window totals.
 * The first update for a phase only records the baseline (`lastTotalIn`/
 * `lastTotalOut`) and adds nothing — there is no prior point to diff against.
 * Later updates add the positive growth over the stored baseline (`GREATEST(...,
 * 0)`), so a context reset/compaction never subtracts, then advance the baseline.
 */
export async function recordPhaseTokens(
	db: Db,
	itemId: number,
	phaseIdx: number,
	totalIn: number,
	totalOut: number,
): Promise<void> {
	await db
		.insert(phaseUsage)
		.values({ itemId, phaseIdx, lastTotalIn: totalIn, lastTotalOut: totalOut })
		.onConflictDoUpdate({
			target: [phaseUsage.itemId, phaseUsage.phaseIdx],
			set: {
				tokensDown: sql`${phaseUsage.tokensDown} + CASE WHEN ${phaseUsage.lastTotalIn} IS NULL THEN 0 ELSE GREATEST(excluded.last_total_in - ${phaseUsage.lastTotalIn}, 0) END`,
				tokensUp: sql`${phaseUsage.tokensUp} + CASE WHEN ${phaseUsage.lastTotalOut} IS NULL THEN 0 ELSE GREATEST(excluded.last_total_out - ${phaseUsage.lastTotalOut}, 0) END`,
				lastTotalIn: sql`excluded.last_total_in`,
				lastTotalOut: sql`excluded.last_total_out`,
			},
		});
}
