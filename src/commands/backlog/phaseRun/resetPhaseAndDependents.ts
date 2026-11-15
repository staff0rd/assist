import type { BacklogDatabase } from "../../../shared/db/Db";
import type { PlanPhase } from "../types";
import { dependentPhases } from "./dependentPhases";
import { setPhaseRunState } from "./setPhaseRunState";

/** Return a phase and everything depending on it to pending, which cancels any of them still running. */
export async function resetPhaseAndDependents(
	db: BacklogDatabase,
	itemId: number,
	plan: PlanPhase[],
	idx: number,
): Promise<void> {
	await setPhaseRunState(db, itemId, dependentPhases(plan, idx), null);
}
