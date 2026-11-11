import { resolveHarness } from "../../shared/harnessAdapters/harnessLabel";
import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import { askQuestionEnabled } from "../askQuestion/askQuestionEnabled";
import { previewAnswerWaitBlocker } from "../askQuestion/previewAnswerWaitBlocker";
import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem, PlanPhase } from "./types";

export const REVIEW_PHASE_NAME = "Review";

export function buildPhasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	harness?: HarnessKind,
): string {
	const config = loadConfig();
	const worktree = config.worktree;
	const commitBeforePhaseEnd =
		worktree?.commitBeforePhaseEnd ??
		worktree?.commitBeforeManualChecks ??
		false;

	const askCheck =
		askQuestionEnabled(config) &&
		previewAnswerWaitBlocker(resolveHarness(harness)) === undefined;
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
