import type { ReviewerResult } from "./runStreamingChild";

export function skipReason(
	results: ReviewerResult[],
	failures: ReviewerResult[],
): string | undefined {
	if (failures.length === results.length)
		return "Both reviewers failed; skipping synthesis.";
	if (results.every((r) => r.exitCode !== 0 || r.skipped))
		return "No reviewer produced a review; skipping synthesis.";
	return undefined;
}
