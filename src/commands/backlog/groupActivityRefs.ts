const ACTIVITY_COMMIT_LIMIT = 10;

type ActivityRef = { kind: "branch" | "commit" | "pr" | "slack" };

type GroupedActivity<T extends ActivityRef> = {
	branches: T[];
	commits: T[];
	prs: T[];
	slacks: T[];
	hiddenCommits: number;
};

export function groupActivityRefs<T extends ActivityRef>(
	refs: T[],
	commitLimit: number = ACTIVITY_COMMIT_LIMIT,
): GroupedActivity<T> {
	const newestFirst = (kind: ActivityRef["kind"]): T[] =>
		refs.filter((r) => r.kind === kind).reverse();
	const commits = newestFirst("commit");
	return {
		branches: newestFirst("branch"),
		commits: commits.slice(0, commitLimit),
		prs: newestFirst("pr"),
		slacks: newestFirst("slack"),
		hiddenCommits: Math.max(0, commits.length - commitLimit),
	};
}
