import { resolvePlan } from "./resolvePlan";
import { resolveReviewPhase } from "./resolveReviewPhase";
import type { BacklogItem, PlanPhase } from "./types";

/**
 * The full phase list an item actually runs through: the resolved plan (authored
 * phases, or a synthetic "Implement" for plan-less items like bugs) followed by
 * the "Review" phase (the stored one when a manual check was bumped to it). Mirrors
 * how {@link ./runReview.runReview} composes phases at runtime, so rewind
 * validation matches the phases the runner produced.
 */
export function resolveRewindPlan(item: BacklogItem): PlanPhase[] {
	return [...resolvePlan(item), resolveReviewPhase(item)];
}
