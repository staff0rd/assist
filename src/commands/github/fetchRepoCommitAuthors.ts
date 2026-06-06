import { runGhGraphql } from "../../shared/runGhGraphql";

const HISTORY_QUERY = `query($org: String!, $repo: String!, $since: GitTimestamp!, $cursor: String) { repository(owner: $org, name: $repo) { defaultBranchRef { target { ... on Commit { history(since: $since, first: 100, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { author { user { login } name } } } } } } } }`;

type CommitNode = {
	author: { user: { login: string } | null; name: string | null } | null;
};

type HistoryResponse = {
	data: {
		repository: {
			defaultBranchRef: {
				target: {
					history?: {
						pageInfo: { hasNextPage: boolean; endCursor: string | null };
						nodes: CommitNode[];
					};
				} | null;
			} | null;
		} | null;
	};
};

export type AuthorCommitCount = { author: string; commitCount: number };

export function fetchRepoCommitAuthors(
	org: string,
	repo: string,
	since: string,
): AuthorCommitCount[] {
	const counts = new Map<string, number>();
	let cursor: string | undefined;

	for (;;) {
		const vars: Record<string, string> = { org, repo, since };
		if (cursor) vars.cursor = cursor;

		const response = JSON.parse(
			runGhGraphql(HISTORY_QUERY, vars),
		) as HistoryResponse;
		const history = response.data.repository?.defaultBranchRef?.target?.history;
		if (!history) break;

		for (const node of history.nodes) {
			const author = node.author?.user?.login ?? node.author?.name ?? "unknown";
			counts.set(author, (counts.get(author) ?? 0) + 1);
		}

		if (!history.pageInfo.hasNextPage) break;
		cursor = history.pageInfo.endCursor ?? undefined;
	}

	return [...counts]
		.map(([author, commitCount]) => ({ author, commitCount }))
		.sort((a, b) => b.commitCount - a.commitCount);
}
