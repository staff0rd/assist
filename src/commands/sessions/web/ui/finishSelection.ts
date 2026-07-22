import { type Caret, caretFromPoint, orderedRange } from "./caretFromPoint";
import type { PendingComment } from "./PrCommentPopover";
import { rangeToOffsets } from "./rangeToOffsets";
import { snapRangeToWords } from "./snapRangeToWords";

export function startCaret(
	wrapper: HTMLElement,
	content: HTMLElement,
	x: number,
	y: number,
): Caret | null {
	const el = document.elementFromPoint(x, y);
	if (!el || el === wrapper || el === content || !content.contains(el))
		return null;
	const caret = caretFromPoint(x, y);
	if (!caret || !content.contains(caret.node)) return null;
	return caret;
}

export function snappedRange(anchor: Caret, focus: Caret): Range {
	return snapRangeToWords(orderedRange(anchor, focus));
}

export function finishSelection(
	content: HTMLElement,
	anchor: Caret,
	focus: Caret,
): PendingComment | null {
	const range = snappedRange(anchor, focus);
	const quote = range.toString().trim();
	const { start, end } = rangeToOffsets(content, range);
	if (!quote || start === end) return null;
	const rect = range.getBoundingClientRect();
	return { quote, top: rect.bottom, left: rect.left, start, end };
}
