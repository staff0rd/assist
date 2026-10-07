import type { HighLevelTestFile, HighLevelTestNode } from "./types";

function countNodes(nodes: HighLevelTestNode[]): number {
	return nodes.reduce(
		(sum, node) => sum + (node.kind === "it" ? 1 : countNodes(node.children)),
		0,
	);
}

export function highLevelTestCount(files: HighLevelTestFile[]): number {
	return countNodes(files.flatMap((file) => file.tests));
}
