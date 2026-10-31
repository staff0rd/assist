import type { SavedNode } from "../SavedNode";

export function upsert(nodes: SavedNode[], oldUrl: string, node: SavedNode) {
	const rest = nodes.filter((n) => n.url !== node.url || n.url === oldUrl);
	return rest.some((n) => n.url === oldUrl)
		? rest.map((n) => (n.url === oldUrl ? node : n))
		: [...rest, node];
}
