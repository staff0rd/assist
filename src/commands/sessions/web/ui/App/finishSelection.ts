import { type Caret, caretFromPoint, orderedRange } from "./caretFromPoint";
import type { PendingComment } from "./PendingComment";
import { pendingFromRange } from "./pendingFromRange";
import { snapRangeToWords } from "./finishSelection/snapRangeToWords";
import { skipsSelection } from "./textWalker";

export function startCaret(
	wrapper: HTMLElement,
	content: HTMLElement,
	x: number,
	y: number,
): Caret | null {
	const el = document.elementFromPoint(x, y);
	if (!el || el === wrapper || el === content || !content.contains(el))
		return null;
	if (skipsSelection(el)) return null;
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
	return pendingFromRange(content, snappedRange(anchor, focus));
}
