import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import type { UsageWindowKey } from "../usageWindowKey";
import { resolveCycleResetsAt } from "./resolveCycleResetsAt";
import { phaseCycleContext } from "./schema";

export async function recordPhaseCycleContext(
	db: Db,
	itemId: number,
	phaseIdx: number,
	window: UsageWindowKey,
	resetsAt: number,
	pct: number,
): Promise<void> {
	if (pct <= 0) return;
	const cycleResetsAt = await resolveCycleResetsAt(db, window, resetsAt);
	await db
		.insert(phaseCycleContext)
		.values({
			itemId,
			phaseIdx,
			window,
			resetsAt: cycleResetsAt,
			peakContextPct: pct,
		})
		.onConflictDoUpdate({
			target: [
				phaseCycleContext.itemId,
				phaseCycleContext.phaseIdx,
				phaseCycleContext.window,
				phaseCycleContext.resetsAt,
			],
			set: {
				peakContextPct: sql`GREATEST(${phaseCycleContext.peakContextPct}, ${pct})`,
			},
		});
}
