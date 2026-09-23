import { bucketPr } from "./bucketPr";
import { describeAge } from "./describeAge";
import { isDoNotMerge } from "./isDoNotMerge";
import { summariseChecks } from "./summariseChecks";
import type {
	GhStatusPullRequest,
	PrStatus,
	PrStatusFacts,
	ReviewerState,
} from "./types";

const STALE_HOURS = 168;

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

	const facts: PrStatusFacts = {
		number: pr.number,
		title: pr.title,
		url: pr.url,
		author: pr.author?.login ?? "unknown",
		isBot: pr.author?.is_bot === true,
		isDraft: pr.isDraft === true,
		isDoNotMerge: isDoNotMerge(pr.title),
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

	return {
		...facts,
		bucket: bucketPr(facts),
		isStale: (age.hours ?? 0) >= STALE_HOURS,
	};
}
