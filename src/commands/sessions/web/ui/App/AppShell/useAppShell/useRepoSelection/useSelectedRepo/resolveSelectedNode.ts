import { LOCAL_NODE, type MergedRepo } from "../mergeRepos";

export type RepoPick = { cwd: string; node?: string };

export function resolveSelectedNode(
	repos: MergedRepo[],
	pick: RepoPick,
	machine: string,
): string {
	if (pick.node !== undefined) return pick.node;
	const owners = new Set(
		repos.flatMap((repo) =>
			Object.entries(repo.clones)
				.filter(([, cwd]) => cwd === pick.cwd)
				.map(([node]) => node),
		),
	);
	if (owners.has(machine)) return machine;
	if (owners.size === 0 || owners.has(LOCAL_NODE)) return LOCAL_NODE;
	return [...owners][0];
}
