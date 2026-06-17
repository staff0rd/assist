import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import type { PlanPhase } from "./types";

export function buildReviewPhase(): PlanPhase {
	return {
		name: REVIEW_PHASE_NAME,
		tasks: [
			{
				task: "Verify acceptance criteria, confirm manual checks, commit, mark done, and signal phase-done.",
			},
		],
	};
}
