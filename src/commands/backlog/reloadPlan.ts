import { resolvePlan } from "./resolvePlan";
import { findOneItem } from "./shared";
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
	const found = await findOneItem(String(id));
	if (!found) return undefined;
	return resolvePlan(found.item);
}
