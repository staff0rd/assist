import { withNode } from "../../withNode";

export type RepoLocation = { cwd?: string; cloneTarget?: string };

export function fetchLocations(origin: string, nodes: string[]) {
	return Promise.all(
		nodes.map(async (node) => {
			const location = await fetchLocation(origin, node).catch(() => ({}));
			return [node, location] as const;
		}),
	);
}

async function fetchLocation(
	origin: string,
	node: string,
): Promise<RepoLocation> {
	const res = await fetch(
		withNode(
			`/api/repo-location?origin=${encodeURIComponent(origin)}`,
			node || undefined,
		),
	);
	return res.ok ? res.json() : {};
}
