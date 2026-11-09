import type { PlannedReviewer } from "./planReviewers";
import {
	type ReviewerRunContext,
	runPlannedReviewer,
} from "./runPlannedReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type ReviewersOutcome = {
	results: ReviewerResult[];
	anyFresh: boolean;
	fresh: ReviewerResult[];
};

export async function runReviewers(
	reviewers: PlannedReviewer[],
	context: ReviewerRunContext,
): Promise<ReviewersOutcome> {
	const results = await Promise.all(
		reviewers.map((reviewer) => runPlannedReviewer(reviewer, context)),
	);
	return {
		results,
		anyFresh: reviewers.some(({ plan }) => plan.kind !== "cached"),
		fresh: results.filter((_, i) => reviewers[i].plan.kind === "run"),
	};
}
