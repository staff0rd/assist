import { applyEdit, type DiffVisitorContext, type NodeEdit } from "./applyEdit";
import { applyHtmlEdits } from "./applyHtmlEdits";
import type { BlockDiff } from "./diffBlocks";
import { renderRemovedUnit } from "./renderRemovedUnit";
import type { MdastNode } from "./toDiffBlocks";
import type { DiffUnit, HtmlUnit } from "./toDiffUnits";

type Leaf = Exclude<DiffUnit, { kind: "element" }>;

const firstLeaf = (unit: DiffUnit): Leaf =>
	unit.kind === "element" ? unit.open : unit;
const lastLeaf = (unit: DiffUnit): Leaf =>
	unit.kind === "element" ? unit.close : unit;

export function applyBlockDiff(
	root: MdastNode,
	diff: BlockDiff<DiffUnit>,
	declaredScreenshots: Set<string>,
	ctx: DiffVisitorContext,
): void {
	const nodeEdits = new Map<MdastNode, NodeEdit>();
	const htmlEdits = new Map<HtmlUnit, NodeEdit>();
	const editOf = (leaf: Leaf) => {
		const edits: Map<MdastNode | HtmlUnit, NodeEdit> =
			leaf.kind === "node" ? nodeEdits : htmlEdits;
		const key = leaf.kind === "node" ? leaf.node : leaf;
		const edit = edits.get(key) ?? { before: [], after: [], added: false };
		edits.set(key, edit);
		return edit;
	};
	for (const unit of diff.added) editOf(firstLeaf(unit)).added = true;
	for (const removed of diff.removed) {
		const content = removed.nodes.flatMap((unit) =>
			renderRemovedUnit(unit, declaredScreenshots),
		);
		if (removed.before)
			editOf(firstLeaf(removed.before)).before.push(...content);
		else if (removed.after)
			editOf(lastLeaf(removed.after)).after.push(...content);
		else if (removed.parent?.kind === "element")
			editOf(removed.parent.close).before.push(...content);
		else if (removed.parent?.kind === "node")
			ctx.appendChild(removed.parent.node, content);
		else ctx.appendChild(root, content);
	}
	for (const [node, edit] of nodeEdits) applyEdit(node, edit, ctx);
	applyHtmlEdits(htmlEdits, ctx);
}
