import type { PendingComment } from "./PendingComment";
import { rangeToOffsets } from "./rangeToOffsets";

export function pendingFromRange(
	content: HTMLElement,
	range: Range,
): PendingComment | null {
	const quote = range.toString().trim();
	const { start, end } = rangeToOffsets(content, range);
	if (!quote || start === end) return null;
	const rect = range.getBoundingClientRect();
	return { quote, top: rect.bottom, left: rect.left, start, end };
}
