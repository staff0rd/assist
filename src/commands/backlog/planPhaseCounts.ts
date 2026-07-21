import { sql } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { planPhases } from "../../shared/db/schema";

export function planPhaseCounts(orm: Db) {
	return orm
		.select({
			itemId: planPhases.itemId,
			count: sql<number>`count(*)::int`.as("plan_phase_count"),
		})
		.from(planPhases)
		.groupBy(planPhases.itemId)
		.as("plan_phase_counts");
}
