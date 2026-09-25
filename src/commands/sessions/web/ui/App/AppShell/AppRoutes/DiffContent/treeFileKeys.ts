import type { DiffFileTreeNode } from "./buildDiffFileTree";

export function treeFileKeys(nodes: DiffFileTreeNode[]): string[] {
	return nodes.flatMap((node) =>
		node.kind === "file" ? [node.fileKey] : treeFileKeys(node.children),
	);
}
