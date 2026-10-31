import type { MergedRepo } from "../../mergeRepos";

export function resolveStartCwd(
	repos: MergedRepo[],
	item: { cwd?: string; origin?: string; key: string },
	key: string,
): string | undefined {
	if (key === item.key) return item.cwd;
	const repo =
		repos.find((r) => item.cwd && Object.values(r.clones).includes(item.cwd)) ??
		repos.find((r) => item.origin && r.key === item.origin);
	return repo?.clones[key];
}
