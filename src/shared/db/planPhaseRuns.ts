import { isNotNull, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { planPhases } from "./schema";

/** Per item, the 1-based phases running in parallel and those done ahead of currentPhase. */
export function planPhaseRuns(orm: Db) {
	return orm
		.select({
			itemId: planPhases.itemId,
			running: sql<
				number[] | null
			>`array_agg(${planPhases.idx} + 1) filter (where ${planPhases.runState} = 'running')`.as(
				"running_phases",
			),
			done: sql<
				number[] | null
			>`array_agg(${planPhases.idx} + 1) filter (where ${planPhases.runState} = 'done')`.as(
				"done_phases",
			),
		})
		.from(planPhases)
		.where(isNotNull(planPhases.runState))
		.groupBy(planPhases.itemId)
		.as("plan_phase_runs");
}
