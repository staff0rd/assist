import { printReviewerFailure } from "./formatReviewerFailure";
import type { ReviewerResult } from "./runStreamingChild";

export function printReviewerFailures(results: ReviewerResult[]): void {
	for (const r of results) printReviewerFailure(r);
}
