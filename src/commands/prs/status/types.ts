export type GhStatusCheck = {
	name?: string;
	context?: string;
	status?: string;
	conclusion?: string;
	state?: string;
};

type GhStatusReview = {
	author?: { login?: string } | null;
	state?: string;
};

export type GhStatusPullRequest = {
	number: number;
	title: string;
	url: string;
	author?: { login?: string; is_bot?: boolean } | null;
	isDraft?: boolean;
	createdAt: string;
	updatedAt: string;
	reviewDecision?: string | null;
	latestReviews?: GhStatusReview[] | null;
	statusCheckRollup?: GhStatusCheck[] | null;
	mergeable?: string | null;
};

export type CheckSummary = { failing: string[]; pending: string[] };

export type ReviewerState = { reviewer: string; state: string };

export type PrBucket =
	| "pendingReview"
	| "changesRequested"
	| "failingChecks"
	| "readyToMerge"
	| "excluded";

export type PrStatusFacts = {
	number: number;
	title: string;
	url: string;
	author: string;
	isBot: boolean;
	isDraft: boolean;
	isDoNotMerge: boolean;
	createdAt: string;
	updatedAt: string;
	age: string;
	ageHours: number | null;
	reviewDecision: string | null;
	reviews: ReviewerState[];
	checks: CheckSummary;
	mergeable: string;
	unresolvedThreads: number | null;
};

export type PrStatus = PrStatusFacts & { bucket: PrBucket; isStale: boolean };

export type RepoStatus = { repo: string; pullRequests: PrStatus[] };

type RepoStatusError = { repo: string; error: string };

export type PrsStatusSummary = {
	repos: number;
	open: number;
	excluded: number;
	pendingReview: number;
	changesRequested: number;
	failingChecks: number;
	readyToMerge: number;
	stale: number;
};

export type PrsStatusReport = {
	repos: RepoStatus[];
	errors: RepoStatusError[];
	summary: PrsStatusSummary;
};

export type PrsStatusOptions = { json?: boolean };
