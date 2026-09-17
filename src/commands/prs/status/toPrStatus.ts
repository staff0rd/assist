import { describeAge } from "./describeAge";
import { summariseChecks } from "./summariseChecks";
import type { GhStatusPullRequest, PrStatus, ReviewerState } from "./types";

function toReviews(pr: GhStatusPullRequest): ReviewerState[] {
	return (pr.latestReviews ?? []).map((review) => ({
		reviewer: review.author?.login ?? "unknown",
		state: review.state ?? "UNKNOWN",
	}));
}

export function toPrStatus(
	pr: GhStatusPullRequest,
	unresolvedThreads: number | null,
	now: number = Date.now(),
): PrStatus {
	const age = describeAge(pr.updatedAt, now);

	return {
		number: pr.number,
		title: pr.title,
		url: pr.url,
		author: pr.author?.login ?? "unknown",
		isBot: pr.author?.is_bot === true,
		isDraft: pr.isDraft === true,
		createdAt: pr.createdAt,
		updatedAt: pr.updatedAt,
		age: age.label,
		ageHours: age.hours,
		reviewDecision: pr.reviewDecision || null,
		reviews: toReviews(pr),
		checks: summariseChecks(pr.statusCheckRollup),
		mergeable: pr.mergeable || "UNKNOWN",
		unresolvedThreads,
	};
}
