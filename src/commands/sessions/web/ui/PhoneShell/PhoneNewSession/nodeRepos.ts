import type { MergedRepo } from "../../mergeRepos";

export function nodeRepos(repos: MergedRepo[], key: string): string[] {
	return repos.flatMap((repo) => (repo.clones[key] ? [repo.clones[key]] : []));
}

export function resolveNodeCwd(
	repos: MergedRepo[],
	key: string,
	picked: string | undefined,
): string {
	const onNode = nodeRepos(repos, key);
	if (picked && onNode.includes(picked)) return picked;
	const clone = repos.find((repo) =>
		Object.values(repo.clones).includes(picked ?? ""),
	)?.clones[key];
	return clone ?? onNode[0] ?? "";
}
