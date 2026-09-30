import type { PrSummary } from "../prList";

export type NextChecks = "success" | "failure" | "pending";

export type NextPr = PrSummary & {
	repo: string;
	requestedAt: string;
	reason: "requested" | "peer";
	checks: NextChecks | null;
};

export type RepolessPr = Omit<NextPr, "repo">;

export type NextIssue = PrSummary & { repo: string; labels: string[] };

export type NextSection<T> = { items: T[]; error: string | null };

export type NextScope = {
	selfRepo: string | null;
	peers: string[];
	prRepos: string[] | null;
	issueRepos: string[] | null;
};

export type NextResponse = {
	scope: NextScope;
	peerPrs: NextSection<NextPr>;
	assignedIssues: NextSection<NextIssue>;
};

type Login = { login?: string } | null;

export type GhPeerPrNode = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	isDraft: boolean;
	author?: Login;
	reviewRequests?: {
		nodes?: ({ requestedReviewer?: Login } | null)[];
	} | null;
	latestReviews?: {
		nodes?: ({
			author?: Login;
			state?: string;
			commit?: { oid?: string } | null;
		} | null)[];
	} | null;
	commits?: {
		nodes?: ({
			commit?: {
				oid?: string;
				statusCheckRollup?: { state?: string } | null;
			} | null;
		} | null)[];
	} | null;
	timelineItems?: {
		nodes?: ({ createdAt?: string; requestedReviewer?: Login } | null)[];
	} | null;
};
