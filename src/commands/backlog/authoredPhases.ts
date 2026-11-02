import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import type { PlanPhase } from "./types";

export function authoredPhases(plan: PlanPhase[]): PlanPhase[] {
	return plan.at(-1)?.name === REVIEW_PHASE_NAME ? plan.slice(0, -1) : plan;
}
