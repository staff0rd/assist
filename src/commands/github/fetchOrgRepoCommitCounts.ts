import { runGhGraphql } from "../../shared/runGhGraphql";

const REPOS_QUERY = `query($org: String!, $since: GitTimestamp!, $cursor: String) { organization(login: $org) { repositories(first: 50, orderBy: { field: PUSHED_AT, direction: DESC }, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { name pushedAt defaultBranchRef { target { ... on Commit { history(since: $since) { totalCount } } } } } } } }`;

type RepoNode = {
	name: string;
	pushedAt: string;
	defaultBranchRef: {
		target: { history?: { totalCount: number } } | null;
	} | null;
};

type ReposResponse = {
	data: {
		organization: {
			repositories: {
				pageInfo: { hasNextPage: boolean; endCursor: string | null };
				nodes: RepoNode[];
			};
		} | null;
	};
};

type RepoCommitCount = { name: string; commitCount: number };

export function fetchOrgRepoCommitCounts(
	org: string,
	since: string,
): RepoCommitCount[] {
	const results: RepoCommitCount[] = [];
	let cursor: string | undefined;

	for (;;) {
		const vars: Record<string, string> = { org, since };
		if (cursor) vars.cursor = cursor;

		const response = JSON.parse(
			runGhGraphql(REPOS_QUERY, vars),
		) as ReposResponse;
		const repositories = response.data.organization?.repositories;
		if (!repositories) throw new Error(`Organisation not found: ${org}`);

		for (const node of repositories.nodes) {
			const history = node.defaultBranchRef?.target?.history;
			if (!history) continue;
			results.push({ name: node.name, commitCount: history.totalCount });
		}

		// Repos are ordered by PUSHED_AT desc, so once a page ends before the
		// window starts, no later repo can have commits in the window.
		const lastNode = repositories.nodes[repositories.nodes.length - 1];
		const exhausted = lastNode && new Date(lastNode.pushedAt) < new Date(since);
		if (!repositories.pageInfo.hasNextPage || exhausted) break;
		cursor = repositories.pageInfo.endCursor ?? undefined;
	}

	return results;
}
