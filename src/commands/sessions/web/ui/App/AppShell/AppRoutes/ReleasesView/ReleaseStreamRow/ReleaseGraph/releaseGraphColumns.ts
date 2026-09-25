import type { ReleaseNodeState } from "../../../../../../../releases/types";

function incomingEdges(edges: [string, string][]): Map<string, string[]> {
	const incoming = new Map<string, string[]>();
	for (const [from, to] of edges)
		incoming.set(to, [...(incoming.get(to) ?? []), from]);
	return incoming;
}

function depthResolver(edges: [string, string][]): (id: string) => number {
	const incoming = incomingEdges(edges);
	const known = new Map<string, number>();
	const walking = new Set<string>();
	const depth = (id: string): number => {
		const cached = known.get(id);
		if (cached !== undefined) return cached;
		if (walking.has(id)) return 0;
		walking.add(id);
		const value = Math.max(
			0,
			...(incoming.get(id) ?? []).map((from) => depth(from) + 1),
		);
		walking.delete(id);
		known.set(id, value);
		return value;
	};
	return depth;
}

export function releaseGraphColumns(
	nodes: ReleaseNodeState[],
	edges: [string, string][],
): ReleaseNodeState[][] {
	const depth = depthResolver(edges);
	const columns: ReleaseNodeState[][] = [];
	for (const node of nodes) {
		const index = depth(node.id);
		while (columns.length <= index) columns.push([]);
		columns[index]?.push(node);
	}
	return columns;
}
