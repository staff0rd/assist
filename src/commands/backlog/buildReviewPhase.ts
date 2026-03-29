import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import type { PlanPhase } from "./types";

export function buildReviewPhase(): PlanPhase {
	return {
		name: REVIEW_PHASE_NAME,
		tasks: [
			{
				task: "Verify acceptance criteria, confirm manual checks, mark done, commit, and signal phase-done.",
			},
		],
	};
}
