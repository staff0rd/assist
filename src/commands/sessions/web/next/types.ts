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

export type NextPickup = PrSummary & {
	repo: string;
	labels: string[];
	project: string;
	projectTitle: string;
	itemId: string;
	status: string;
	priority: string | null;
	position: number;
};

export type NextBoard = { project: string; title: string; url: string };

export type NextSection<T> = { items: T[]; error: string | null };

export type NextScope = {
	selfRepo: string | null;
	peers: string[];
	repos: string[] | null;
	projects: string[];
	pickStatuses: string[];
	excludeLabels: string[];
	excludeTypes: string[];
};

export type PickupFilter = Pick<
	NextScope,
	"pickStatuses" | "excludeLabels" | "excludeTypes"
>;

export type NextResponse = {
	scope: NextScope;
	peerPrs: NextSection<NextPr>;
	assignedIssues: NextSection<NextIssue>;
	pickups: NextSection<NextPickup>;
	boards: NextBoard[];
};

type Login = { login?: string } | null;

type SingleSelectValue = { name?: string } | null;

export type GhProjectItemNode = {
	id: string;
	status?: SingleSelectValue;
	priority?: SingleSelectValue;
	content?: {
		number?: number;
		title?: string;
		url?: string;
		createdAt?: string;
		state?: string;
		author?: Login;
		repository?: { nameWithOwner?: string } | null;
		assignees?: { totalCount?: number } | null;
		issueType?: { name?: string } | null;
		labels?: { nodes?: ({ name?: string } | null)[] } | null;
	} | null;
};

export type GhPeerPrNode = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	isDraft: boolean;
	author?: Login;
	repository?: { nameWithOwner?: string } | null;
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
