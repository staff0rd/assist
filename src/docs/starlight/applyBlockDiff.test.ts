import { describe, expect, it, vi } from "vitest";
import { applyBlockDiff } from "./applyBlockDiff";
import { diffBlocks } from "./diffBlocks";
import { type MdastNode, toDiffBlocks } from "./toDiffBlocks";
import type { DiffUnit } from "./toDiffUnits";

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
const unit = (node: MdastNode): DiffUnit => ({ kind: "node", node });
const classOf = (node: MdastNode) =>
	(node.data?.hProperties as { className?: string[] } | undefined)?.className;
const html = (value: string): MdastNode => ({ type: "html", value });
const link = (text: string): MdastNode => ({
	type: "paragraph",
	children: [{ type: "text", value: text }],
});

describe("applyBlockDiff", () => {
	it("marks a changed block added when its old version goes before it", () => {
		const ctx = context();
		const next = unit(paragraph());
		applyBlockDiff(
			{ type: "root" },
			{
				added: [next],
				removed: [{ nodes: [unit(paragraph())], before: next }],
			},
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
			{ added: [unit(node)], removed: [] },
			new Set(),
			ctx,
		);
		expect(ctx.setProperty).toHaveBeenCalledWith(node, "data", {
			hProperties: { className: ["assist-diff-added"] },
		});
		expect(ctx.replaceNode).not.toHaveBeenCalled();
	});

	it("marks a changed HTML element spanning blank lines on its own tag", () => {
		const first = '<div class="cards">\n<article class="other">';
		const open = '<article class="card">\n<h3>Phone</h3>';
		const oldRoot = {
			type: "root",
			children: [
				html(first),
				link("Other"),
				html(`</article>\n${open}\n</article>\n</div>`),
			],
		};
		const close = html("</article>\n</div>");
		const newLink = link("More");
		const newOpen = html(`</article>\n${open}`);
		const newRoot = {
			type: "root",
			children: [html(first), link("Other"), newOpen, newLink, close],
		};
		const ctx = context();
		applyBlockDiff(
			newRoot,
			diffBlocks(toDiffBlocks(oldRoot, ""), toDiffBlocks(newRoot, "")),
			new Set(),
			ctx,
		);
		const replaced = new Map(
			ctx.replaceNode.mock.calls as [MdastNode, MdastNode[]][],
		);
		expect(replaced.get(newOpen)?.map((node) => node.value)).toEqual([
			"</article>",
			"\n",
			'<article class="card assist-diff-removed">',
			"\n<h3>Phone</h3>\n",
			"</article>",
			'<article class="card assist-diff-added">',
			"\n<h3>Phone</h3>",
		]);
		expect(replaced.has(newLink)).toBe(false);
		expect(replaced.has(close)).toBe(false);
	});
});
