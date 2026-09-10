import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { planPhases } from "./schema";

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
