import { apiFetch } from "../../apiFetch";

type CloneBaseReposResponse = { repos: { name: string; cwd: string }[] };

export async function fetchCloneBaseRepos(
	signal: AbortSignal,
): Promise<string[]> {
	const res = await apiFetch("/api/clone-base-repos", { signal });
	if (!res.ok) return [];
	const body = (await res.json()) as CloneBaseReposResponse;
	return body.repos.map((repo) => repo.cwd);
}
