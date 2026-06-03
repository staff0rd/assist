import { and, desc, eq, gte } from "drizzle-orm";
import type { BacklogDatabase } from "./BacklogOrm";
import { planPhases, planTasks } from "./backlogSchema";

/**
 * Shift every phase (and its tasks) at or after `fromIdx` up by one index, in
 * reverse order so the moving rows never collide with an occupied primary key.
 * Used to open a gap before inserting a new phase.
 */
export async function shiftPhasesUp(
	db: BacklogDatabase,
	itemId: number,
	fromIdx: number,
): Promise<void> {
	const toShift = await db
		.select({ idx: planPhases.idx })
		.from(planPhases)
		.where(and(eq(planPhases.itemId, itemId), gte(planPhases.idx, fromIdx)))
		.orderBy(desc(planPhases.idx));

	for (const p of toShift) {
		await db
			.update(planTasks)
			.set({ phaseIdx: p.idx + 1 })
			.where(and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, p.idx)));
		await db
			.update(planPhases)
			.set({ idx: p.idx + 1 })
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, p.idx)));
	}
}
