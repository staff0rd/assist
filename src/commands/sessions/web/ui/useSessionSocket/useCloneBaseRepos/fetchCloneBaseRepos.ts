import type { CloneBaseRepo } from "../../../../shared/CloneBaseRepo";
import { apiFetch } from "../../apiFetch";

type CloneBaseReposResponse = {
	repos: { name: string; cwd: string; origin?: string }[];
};

export async function fetchCloneBaseRepos(
	signal: AbortSignal,
): Promise<CloneBaseRepo[]> {
	const res = await apiFetch("/api/clone-base-repos", { signal });
	if (!res.ok) return [];
	const body = (await res.json()) as CloneBaseReposResponse;
	return body.repos.map(({ cwd, origin }) => ({ cwd, origin }));
}
