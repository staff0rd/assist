import { buildReviewSummary } from "./buildReviewSummary";
import type { UnanchoredFinding } from "./partitionFindings";
import { sanitiseReviewerNames } from "./sanitiseReviewerNames";

export function buildReviewBody(
	markdown: string,
	unanchored: UnanchoredFinding[],
): string {
	return sanitiseReviewerNames(buildReviewSummary(markdown, unanchored));
}
