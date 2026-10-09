import type {
	HighLevelTreeFile,
	HighLevelTreeNode,
} from "../../../../../../../../../../review/highLevel/types";

export function flattenHighLevelTree(
	nodes: HighLevelTreeNode[],
): HighLevelTreeFile[] {
	return nodes.flatMap((node) =>
		node.kind === "file" ? [node] : flattenHighLevelTree(node.children),
	);
}
