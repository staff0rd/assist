import type { ReviewerResult } from "./runStreamingChild";

export function skipReason(
	results: ReviewerResult[],
	failures: ReviewerResult[],
): string | undefined {
	if (failures.length === results.length)
		return "Both reviewers failed; skipping synthesis.";
	return undefined;
}
