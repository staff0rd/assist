import { applyEdit, type DiffVisitorContext, type NodeEdit } from "./applyEdit";
import type { BlockDiff } from "./diffBlocks";
import { docsDiffClasses, renderDiffBlock } from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";
import { toInsertable } from "./toInsertable";

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
