import { resolvePlan } from "./resolvePlan";
import { loadAndFindItem } from "./shared";
import type { PlanPhase } from "./types";

/**
 * Re-resolve the plan from the database. Used between phase executions so that
 * phases added mid-run (e.g. via `assist backlog add-phase`) are picked up
 * instead of running against the stale snapshot captured by `prepareRun`.
 *
 * Returns `undefined` if the item can no longer be found, so callers can fall
 * back to the plan they already hold.
 */
export async function reloadPlan(id: number): Promise<PlanPhase[] | undefined> {
	const result = await loadAndFindItem(String(id));
	if (!result) return undefined;
	return resolvePlan(result.item);
}
