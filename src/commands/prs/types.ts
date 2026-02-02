export type PullRequest = {
	number: number;
	title: string;
	url: string;
	author: { login: string };
	createdAt: string;
	mergedAt: string | null;
	closedAt: string | null;
	state: "OPEN" | "CLOSED" | "MERGED";
	changedFiles: number;
};

type LineComment = {
	type: "line";
	id: number;
	threadId: string;
	user: string;
	path: string;
	line: number | null;
	body: string;
	diff_hunk: string;
};

type ReviewComment = {
	type: "review";
	id: number;
	user: string;
	state: string;
	body: string;
};

export type PrComment = LineComment | ReviewComment;

export type PrsOptions = {
	open?: boolean;
	closed?: boolean;
};
