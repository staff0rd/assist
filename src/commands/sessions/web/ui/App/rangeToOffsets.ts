import { textWalker } from "./textWalker";

type TextOffsets = { start: number; end: number };

function pointToOffset(root: Node, container: Node, offset: number): number {
	const boundary = document.createRange();
	boundary.setStart(container, offset);
	boundary.collapse(true);
	const walker = textWalker(root);
	let total = 0;
	let node = walker.nextNode();
	while (node) {
		if (node === container) return total + offset;
		if (boundary.comparePoint(node, 0) >= 0) return total;
		total += (node.textContent ?? "").length;
		node = walker.nextNode();
	}
	return total;
}

export function rangeToOffsets(root: Node, range: Range): TextOffsets {
	return {
		start: pointToOffset(root, range.startContainer, range.startOffset),
		end: pointToOffset(root, range.endContainer, range.endOffset),
	};
}

export function offsetsToRange(
	root: Node,
	{ start, end }: TextOffsets,
): Range | null {
	if (start < 0 || end < start) return null;
	const range = document.createRange();
	const walker = textWalker(root);
	let total = 0;
	let startSet = false;
	let node = walker.nextNode();
	while (node) {
		const len = (node.textContent ?? "").length;
		if (!startSet && start <= total + len) {
			range.setStart(node, start - total);
			startSet = true;
		}
		if (startSet && end <= total + len) {
			range.setEnd(node, end - total);
			return range;
		}
		total += len;
		node = walker.nextNode();
	}
	return null;
}
