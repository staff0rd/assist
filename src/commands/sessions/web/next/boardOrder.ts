import type { GhProjectItemNode } from "./types";

export function boardOrder(nodes: GhProjectItemNode[]) {
	const positionOf = new Map<string, number>();
	nodes.forEach((node, position) => {
		if (node.content?.url) positionOf.set(node.content.url, position);
	});
	const parentOf = (position: number) => {
		const url = nodes[position]?.content?.parent?.url;
		return url === undefined ? undefined : positionOf.get(url);
	};
	return (position: number): number[] => {
		const ancestry = [position];
		for (
			let parent = parentOf(position);
			parent !== undefined && !ancestry.includes(parent);
			parent = parentOf(parent)
		)
			ancestry.unshift(parent);
		return ancestry;
	};
}
