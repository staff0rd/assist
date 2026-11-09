import type { NodeSelection } from "../useNodeSelection";

export function viewedLinkedNodes(
	activeNode: string | undefined,
	selection: Pick<NodeSelection, "nodes" | "selected">,
): string[] {
	const local = selection.nodes?.local;
	const viewed = new Set(
		[activeNode, selection.selected].filter(
			(node): node is string => !!node && node !== local,
		),
	);
	return [...viewed];
}
