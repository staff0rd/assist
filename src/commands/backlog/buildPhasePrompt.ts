import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem, PlanPhase } from "./types";

export const REVIEW_PHASE_NAME = "Review";

export function buildPhasePrompt(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
): string {
	if (phase.name === REVIEW_PHASE_NAME) {
		return buildReviewPrompt(item, phaseIndex);
	}
	return buildAuthoredPhasePrompt(item, phaseIndex, phase);
}
