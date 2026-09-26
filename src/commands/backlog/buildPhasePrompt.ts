import { loadConfig } from "../../shared/loadConfig";
import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem, PlanPhase } from "./types";

export const REVIEW_PHASE_NAME = "Review";

export function buildPhasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
): string {
	const worktree = loadConfig().worktree;
	const commitBeforePhaseEnd =
		worktree?.commitBeforePhaseEnd ??
		worktree?.commitBeforeManualChecks ??
		false;

	if (phase.name === REVIEW_PHASE_NAME) {
		return buildReviewPrompt(item, phaseNumber, { commitBeforePhaseEnd });
	}
	return buildAuthoredPhasePrompt(item, phaseNumber, phase, {
		commitBeforePhaseEnd,
	});
}
