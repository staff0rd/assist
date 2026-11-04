import { highLevelSlicesByPath } from "../../../../../../../review/highLevel/highLevelSlicesByPath";
import type {
	HighLevelSlice,
	HighLevelSliceRef,
	HighLevelStructure,
	HighLevelTreeNode,
} from "../../../../../../../review/highLevel/types";

function tagNodes(
	nodes: HighLevelTreeNode[],
	byPath: Map<string, HighLevelSliceRef[]>,
	critical: ReadonlySet<string>,
): HighLevelTreeNode[] {
	return nodes.map((node) => {
		if (node.kind === "dir")
			return { ...node, children: tagNodes(node.children, byPath, critical) };
		const slices = byPath.get(node.path);
		return {
			...node,
			...(slices ? { slices } : {}),
			...(critical.has(node.path) ? { critical: true } : {}),
		};
	});
}

export function tagHighLevelStructure(
	structure: HighLevelStructure,
	slices: HighLevelSlice[],
	criticalPaths: ReadonlySet<string>,
): HighLevelStructure {
	return {
		...structure,
		tree: tagNodes(
			structure.tree,
			highLevelSlicesByPath(slices),
			criticalPaths,
		),
	};
}
