import type { PrBucket, PrStatusFacts } from "./types";

function isApproved(pr: PrStatusFacts): boolean {
	if (pr.reviewDecision) return pr.reviewDecision === "APPROVED";
	return pr.reviews.some((review) => review.state === "APPROVED");
}

export function bucketPr(pr: PrStatusFacts): PrBucket {
	if (pr.isDraft || pr.isDoNotMerge) return "excluded";

	const failing =
		pr.checks.failing.length > 0 || pr.mergeable === "CONFLICTING";
	const unresolved = (pr.unresolvedThreads ?? 0) > 0;
	const changesRequested = pr.reviewDecision === "CHANGES_REQUESTED";

	if (!failing && !unresolved && !changesRequested && !isApproved(pr)) {
		return "pendingReview";
	}
	if (changesRequested || unresolved) return "changesRequested";
	if (failing) return "failingChecks";
	return "readyToMerge";
}
