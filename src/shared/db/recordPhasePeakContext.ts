import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function recordPhasePeakContext(
	db: Db,
	itemId: number,
	phaseIdx: number,
	pct: number,
): Promise<void> {
	await db
		.insert(phaseUsage)
		.values({ itemId, phaseIdx, peakContextPct: pct })
		.onConflictDoUpdate({
			target: [phaseUsage.itemId, phaseUsage.phaseIdx],
			set: {
				peakContextPct: sql`GREATEST(${phaseUsage.peakContextPct}, ${pct})`,
			},
		});
}
