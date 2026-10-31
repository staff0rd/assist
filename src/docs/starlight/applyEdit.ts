import {
	docsDiffClasses,
	isClassable,
	renderDiffBlock,
	withClass,
} from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";

export type DiffVisitorContext = {
	source: string;
	setProperty(node: MdastNode, key: "data", value: MdastNode["data"]): void;
	replaceNode(node: MdastNode, replacement: MdastNode[]): void;
	appendChild(node: MdastNode, content: MdastNode[]): void;
	prependChild(node: MdastNode, content: MdastNode[]): void;
};

export type NodeEdit = {
	before: MdastNode[];
	after: MdastNode[];
	added: boolean;
};

export function applyEdit(
	node: MdastNode,
	{ before, after, added }: NodeEdit,
	ctx: DiffVisitorContext,
): void {
	if (before.length === 0 && after.length === 0) {
		if (!added) return;
		if (isClassable(node))
			ctx.setProperty(
				node,
				"data",
				withClass(node.data, docsDiffClasses.added),
			);
		else ctx.replaceNode(node, renderDiffBlock(node, docsDiffClasses.added));
		return;
	}
	const self = added ? renderDiffBlock(node, docsDiffClasses.added) : [node];
	ctx.replaceNode(node, [...before, ...self, ...after]);
}
