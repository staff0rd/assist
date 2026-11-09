import { cachedReviewerResult } from "./cachedReviewerResult";
import type { ReviewerSlot } from "./reviewerSlots";
import { reviewerAvailable } from "./reviewerAvailable";
import type { ReviewerResult } from "./runStreamingChild";

type ReviewerPlan =
	| { kind: "cached"; cached: ReviewerResult }
	| { kind: "run" }
	| { kind: "skipped" };

export type PlannedReviewer = { slot: ReviewerSlot; plan: ReviewerPlan };

async function planReviewer(slot: ReviewerSlot): Promise<ReviewerPlan> {
	const cached = cachedReviewerResult(slot.name, slot.outputPath);
	if (cached) return { kind: "cached", cached };
	if (await reviewerAvailable(slot)) return { kind: "run" };
	console.log(`Skipping ${slot.name} reviewer.`);
	return { kind: "skipped" };
}

export async function planReviewers(
	slots: ReviewerSlot[],
): Promise<PlannedReviewer[]> {
	const planned: PlannedReviewer[] = [];
	for (const slot of slots)
		planned.push({ slot, plan: await planReviewer(slot) });
	return planned;
}
