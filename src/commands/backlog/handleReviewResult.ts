import type { ReviewResult } from "./runReview";
import { setStatus } from "./shared";
import type { PlanPhase } from "./types";

type RunResult = ReviewResult | { kind: "fail" } | { kind: "paused" };

type ReviewOutcome =
	| { kind: "stop"; success: boolean }
	| { kind: "resume"; startPhase: number; plan: PlanPhase[] };

export async function handleReviewResult(
	id: string,
	review: RunResult,
): Promise<ReviewOutcome> {
	if (review.kind === "fail" || review.kind === "abort")
		return { kind: "stop", success: false };
	if (review.kind === "incomplete") return { kind: "stop", success: false };
	// why: auto-advance off ends the run with the item left in-progress, not done.
	if (review.kind === "paused") return { kind: "stop", success: true };
	// why: rewindPhase already reset the status and rewound the current phase, so
	// resume from there rather than finishing.
	if (review.kind === "rewind")
		return {
			kind: "resume",
			startPhase: review.targetPhase,
			plan: review.plan,
		};
	await ensureDone(id);
	return { kind: "stop", success: true };
}

async function ensureDone(id: string): Promise<void> {
	try {
		await setStatus(id, "done");
	} catch {
		// Item may already be marked done by the review agent — ignore
	}
}
