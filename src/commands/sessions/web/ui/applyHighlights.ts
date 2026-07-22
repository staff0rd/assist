import { offsetsToRange } from "./rangeToOffsets";

type ColoredOffsets = { start: number; end: number; color: string };

function wrapWithinNode(
	node: Text,
	start: number,
	end: number,
	color: string,
): void {
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, end);
	const mark = document.createElement("mark");
	mark.className = "pr-comment";
	mark.style.backgroundColor = color;
	range.surroundContents(mark);
}

function wrapRange(root: Node, range: Range, color: string): void {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const targets: { node: Text; start: number; end: number }[] = [];
	let node = walker.nextNode();
	while (node) {
		const text = node as Text;
		if (range.intersectsNode(text)) {
			const start = text === range.startContainer ? range.startOffset : 0;
			const end = text === range.endContainer ? range.endOffset : text.length;
			if (start < end) targets.push({ node: text, start, end });
		}
		node = walker.nextNode();
	}
	for (const t of targets) wrapWithinNode(t.node, t.start, t.end, color);
}

export function applyHighlights(
	root: HTMLElement,
	ranges: ColoredOffsets[],
): void {
	for (const offsets of ranges) {
		const range = offsetsToRange(root, offsets);
		if (range) wrapRange(root, range, offsets.color);
	}
}
