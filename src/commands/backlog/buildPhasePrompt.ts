import { loadConfig } from "../../shared/loadConfig";
import { askQuestionEnabled } from "../askQuestion/askQuestionEnabled";
import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem, PlanPhase } from "./types";

export const REVIEW_PHASE_NAME = "Review";

export function buildPhasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
): string {
	const config = loadConfig();
	const worktree = config.worktree;
	const commitBeforePhaseEnd =
		worktree?.commitBeforePhaseEnd ??
		worktree?.commitBeforeManualChecks ??
		false;

	const askCheck = askQuestionEnabled(config);
	if (phase.name === REVIEW_PHASE_NAME) {
		return buildReviewPrompt(item, phaseNumber, {
			commitBeforePhaseEnd,
			askCheck,
			manualChecks: phase.manualChecks,
		});
	}
	return buildAuthoredPhasePrompt(item, phaseNumber, phase, {
		commitBeforePhaseEnd,
		askCheck,
	});
}
