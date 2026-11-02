import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { buildReviewPhase } from "./buildReviewPhase";
import type { BacklogItem, PlanPhase } from "./types";

export function resolveReviewPhase(item: BacklogItem): PlanPhase {
	const stored = item.plan?.at(-1);
	return stored?.name === REVIEW_PHASE_NAME ? stored : buildReviewPhase();
}
