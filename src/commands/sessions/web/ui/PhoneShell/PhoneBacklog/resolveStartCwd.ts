import type { MergedRepo } from "../../mergeRepos";

function sameKey(a: string, b: string): boolean {
	return a.toLowerCase() === b.toLowerCase();
}

export function resolveStartCwd(
	repos: MergedRepo[],
	item: { cwd?: string; origin?: string; key: string },
	key: string,
): string | undefined {
	const scoped = repos.find(
		(r) => item.cwd && Object.values(r.clones).includes(item.cwd),
	);
	const foreign =
		!!item.origin && !!scoped?.origin && !sameKey(scoped.origin, item.origin);
	if (key === item.key && !foreign) return item.cwd;
	const repo =
		(foreign ? undefined : scoped) ??
		repos.find((r) => item.origin && sameKey(r.key, item.origin));
	return repo?.clones[key];
}
