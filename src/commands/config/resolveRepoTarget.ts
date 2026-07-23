type ResolvedRepoTarget = {
	key: string;
	value: string | undefined;
	useRepo: boolean;
	repoName: string | undefined;
};

export function resolveRepoTarget(
	key: string,
	value: string | undefined,
	repo: boolean | string | undefined,
): ResolvedRepoTarget {
	if (typeof repo === "string") {
		if (value === undefined) {
			return { key: repo, value: key, useRepo: true, repoName: undefined };
		}
		return { key, value, useRepo: true, repoName: repo };
	}
	return { key, value, useRepo: repo === true, repoName: undefined };
}
