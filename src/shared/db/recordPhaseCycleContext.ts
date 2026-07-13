import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseCycleContext } from "./schema";

export async function recordPhaseCycleContext(
	db: Db,
	itemId: number,
	phaseIdx: number,
	window: "five_hour" | "seven_day",
	resetsAt: number,
	pct: number,
): Promise<void> {
	if (pct <= 0) return;
	await db
		.insert(phaseCycleContext)
		.values({ itemId, phaseIdx, window, resetsAt, peakContextPct: pct })
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
