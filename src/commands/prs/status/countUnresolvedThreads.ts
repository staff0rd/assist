import { fetchReviewThreads } from "./fetchReviewThreads";

export function countUnresolvedThreads(
	org: string,
	repo: string,
	prNumber: number,
): number | null {
	try {
		return fetchReviewThreads(org, repo, prNumber).filter(
			(thread) => !thread.isResolved,
		).length;
	} catch {
		return null;
	}
}
