import { repoName } from "../../../../../RepoList";

export function filterReposByName(repos: string[], query: string): string[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return repos;
	return repos.filter((cwd) => repoName(cwd).toLowerCase().includes(needle));
}
