import { withCwd } from "./withCwd";

export type RepoSummary = {
	origin: string;
	displayName: string;
	openCount: number;
	isCurrent: boolean;
	cwd?: string;
	cloneTarget?: string;
};

function summaryUrl(knownCwds: string[]): string {
	const params = new URLSearchParams();
	for (const cwd of knownCwds) params.append("knownCwd", cwd);
	const qs = params.toString();
	return qs ? `/api/backlog/summary?${qs}` : "/api/backlog/summary";
}

type FetchRepoSummariesOptions = {
	cwd?: string;
	node?: string;
	knownCwds: string[];
	signal?: AbortSignal;
};

export async function fetchRepoSummaries({
	cwd,
	node,
	knownCwds,
	signal,
}: FetchRepoSummariesOptions): Promise<RepoSummary[]> {
	const res = await fetch(withCwd(summaryUrl(knownCwds), cwd, node), {
		signal,
	});
	return res.json();
}
