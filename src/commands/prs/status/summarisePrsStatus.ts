import type { PrsStatusSummary, RepoStatus } from "./types";

export function summarisePrsStatus(repos: RepoStatus[]): PrsStatusSummary {
	const summary: PrsStatusSummary = {
		repos: repos.length,
		open: 0,
		excluded: 0,
		pendingReview: 0,
		changesRequested: 0,
		failingChecks: 0,
		readyToMerge: 0,
		stale: 0,
	};

	for (const pr of repos.flatMap((repo) => repo.pullRequests)) {
		summary[pr.bucket]++;
		if (pr.bucket === "excluded") continue;
		summary.open++;
		if (pr.isStale) summary.stale++;
	}

	return summary;
}
