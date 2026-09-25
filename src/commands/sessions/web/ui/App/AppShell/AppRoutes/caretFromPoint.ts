export type OverlayRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export type Caret = { node: Node; offset: number };

export function caretFromPoint(x: number, y: number): Caret | null {
	const doc = document as Document & {
		caretRangeFromPoint?: (x: number, y: number) => Range | null;
		caretPositionFromPoint?: (
			x: number,
			y: number,
		) => { offsetNode: Node; offset: number } | null;
	};
	const range = doc.caretRangeFromPoint?.(x, y);
	if (range) return { node: range.startContainer, offset: range.startOffset };
	const pos = doc.caretPositionFromPoint?.(x, y);
	if (pos) return { node: pos.offsetNode, offset: pos.offset };
	return null;
}

export function orderedRange(anchor: Caret, focus: Caret): Range {
	const a = document.createRange();
	a.setStart(anchor.node, anchor.offset);
	const f = document.createRange();
	f.setStart(focus.node, focus.offset);
	const forward = a.compareBoundaryPoints(Range.START_TO_START, f) <= 0;
	const range = document.createRange();
	const [s, e] = forward ? [anchor, focus] : [focus, anchor];
	range.setStart(s.node, s.offset);
	range.setEnd(e.node, e.offset);
	return range;
}

export function overlayRects(
	range: Range,
	wrapper: HTMLElement,
): OverlayRect[] {
	const base = wrapper.getBoundingClientRect();
	return Array.from(range.getClientRects()).map((r) => ({
		top: r.top - base.top + wrapper.scrollTop,
		left: r.left - base.left + wrapper.scrollLeft,
		width: r.width,
		height: r.height,
	}));
}
