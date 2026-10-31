import { describe, expect, it, vi } from "vitest";
import { applyBlockDiff } from "./applyBlockDiff";
import type { MdastNode } from "./toDiffBlocks";

function context() {
	return {
		source: "",
		setProperty: vi.fn(),
		replaceNode: vi.fn(),
		appendChild: vi.fn(),
		prependChild: vi.fn(),
	};
}

const paragraph = (): MdastNode => ({ type: "paragraph", children: [] });
const classOf = (node: MdastNode) =>
	(node.data?.hProperties as { className?: string[] } | undefined)?.className;

describe("applyBlockDiff", () => {
	it("marks a changed block added when its old version goes before it", () => {
		const ctx = context();
		const root = { type: "root" };
		const next = paragraph();
		applyBlockDiff(
			root,
			{ added: [next], removed: [{ nodes: [paragraph()], before: next }] },
			new Set(),
			ctx,
		);
		const [, replacement] = ctx.replaceNode.mock.calls[0] as [
			MdastNode,
			MdastNode[],
		];
		expect(replacement.map(classOf)).toEqual([
			["assist-diff-removed"],
			["assist-diff-added"],
		]);
		expect(ctx.setProperty).not.toHaveBeenCalled();
	});

	it("sets the added class in place when nothing is inserted beside it", () => {
		const ctx = context();
		const node = paragraph();
		applyBlockDiff(
			{ type: "root" },
			{ added: [node], removed: [] },
			new Set(),
			ctx,
		);
		expect(ctx.setProperty).toHaveBeenCalledWith(node, "data", {
			hProperties: { className: ["assist-diff-added"] },
		});
		expect(ctx.replaceNode).not.toHaveBeenCalled();
	});
});
