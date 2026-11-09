import { act, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

type CaretDoc = {
	caretRangeFromPoint?: ((x: number, y: number) => Range | null) | undefined;
	elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};

function textNodeContaining(root: Element, text: string): Text {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode())
		if (node.textContent?.includes(text)) return node as Text;
	throw new Error(`text not found: ${text}`);
}

function caretAt(node: Node, offset: number): Range {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	return range;
}

export function selectPreviewText(root: Element, text: string) {
	if (!Range.prototype.getBoundingClientRect)
		Range.prototype.getBoundingClientRect = () =>
			({
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 0,
				height: 0,
			}) as DOMRect;
	if (!Range.prototype.getClientRects)
		Range.prototype.getClientRects = () =>
			({
				length: 0,
				item: () => null,
				[Symbol.iterator]: [][Symbol.iterator],
			}) as unknown as DOMRectList;

	const node = textNodeContaining(root, text);
	const idx = (node.textContent ?? "").indexOf(text);
	const doc = document as CaretDoc;
	doc.elementFromPoint = vi.fn().mockReturnValue(node.parentElement);
	doc.caretRangeFromPoint = vi
		.fn()
		.mockReturnValueOnce(caretAt(node, idx))
		.mockReturnValue(caretAt(node, idx + text.length));

	fireEvent.mouseDown(node.parentElement as Element, {
		clientX: 1,
		clientY: 1,
	});
	act(() => {
		globalThis.dispatchEvent(
			new MouseEvent("mouseup", { clientX: 2, clientY: 1, bubbles: true }),
		);
	});
}
