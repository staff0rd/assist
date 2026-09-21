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

export type PrStatus = {
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

type RepoStatus = { repo: string; pullRequests: PrStatus[] };

type RepoStatusError = { repo: string; error: string };

export type PrsStatusReport = {
	repos: RepoStatus[];
	errors: RepoStatusError[];
};

export type PrsStatusOptions = { json?: boolean };
