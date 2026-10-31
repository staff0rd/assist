import type { BlockDiff } from "./diffBlocks";
import {
	docsDiffClasses,
	isClassable,
	renderDiffBlock,
	withClass,
} from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";
import { toInsertable } from "./toInsertable";

export type DiffVisitorContext = {
	source: string;
	setProperty(node: MdastNode, key: "data", value: MdastNode["data"]): void;
	replaceNode(node: MdastNode, replacement: MdastNode[]): void;
	appendChild(node: MdastNode, content: MdastNode[]): void;
	prependChild(node: MdastNode, content: MdastNode[]): void;
};

type NodeEdit = { before: MdastNode[]; after: MdastNode[]; added: boolean };

function applyEdit(
	node: MdastNode,
	{ before, after, added }: NodeEdit,
	ctx: DiffVisitorContext,
): void {
	const classable = isClassable(node);
	if (added && classable)
		ctx.setProperty(node, "data", withClass(node.data, docsDiffClasses.added));
	const wrapped = added && !classable;
	if (before.length === 0 && after.length === 0 && !wrapped) return;
	const self = wrapped ? renderDiffBlock(node, docsDiffClasses.added) : [node];
	ctx.replaceNode(node, [...before, ...self, ...after]);
}

export function applyBlockDiff(
	root: MdastNode,
	diff: BlockDiff<MdastNode>,
	declaredScreenshots: Set<string>,
	ctx: DiffVisitorContext,
): void {
	const edits = new Map<MdastNode, NodeEdit>();
	const editOf = (node: MdastNode) => {
		const edit = edits.get(node) ?? { before: [], after: [], added: false };
		edits.set(node, edit);
		return edit;
	};
	for (const node of diff.added) editOf(node).added = true;
	for (const removed of diff.removed) {
		const content = removed.nodes.flatMap((node) =>
			renderDiffBlock(
				toInsertable(node, declaredScreenshots),
				docsDiffClasses.removed,
			),
		);
		if (removed.before) editOf(removed.before).before.push(...content);
		else if (removed.after) editOf(removed.after).after.push(...content);
		else ctx.appendChild(removed.parent ?? root, content);
	}
	for (const [node, edit] of edits) applyEdit(node, edit, ctx);
}
