import type { ReviewerResult } from "./runStreamingChild";

export function skipReason(
	results: ReviewerResult[],
	failures: ReviewerResult[],
	strict: boolean,
): string | undefined {
	if (failures.length === results.length)
		return "Both reviewers failed; skipping synthesis.";
	if (strict && failures.length > 0)
		return "A reviewer failed; skipping synthesis.";
	return undefined;
}
