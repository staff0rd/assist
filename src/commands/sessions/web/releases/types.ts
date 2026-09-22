export type ReleaseCommit = {
	sha: string;
	subject: string | null;
	author: string | null;
};

export type ReleaseNodeKind = "environment" | "build" | "gate";

export type ReleaseRunNodeStatus = "ok" | "gate" | "running" | "fail" | "idle";

export type ReleaseRunNodeState = {
	status: ReleaseRunNodeStatus;
	conclusion: string | null;
	startedAt: string | null;
	completedAt: string | null;
	url: string | null;
};

export type ReleaseNodeState = {
	id: string;
	kind: ReleaseNodeKind;
	environment: string | null;
	label: string;
	live: ReleaseCommit | null;
	deployedAt: string | null;
	behind: number | null;
	queued: ReleaseCommit | null;
	run: ReleaseRunNodeState | null;
};

export type ReleaseRunState = {
	number: number;
	url: string;
	headSha: string;
	status: string;
	startedAt: string | null;
};

export type ReleaseStreamState = {
	name: string;
	repo: string;
	workflow: string;
	defaultBranch: string | null;
	head: ReleaseCommit | null;
	nodes: ReleaseNodeState[];
	edges: [string, string][];
	run: ReleaseRunState | null;
	error?: string;
};
