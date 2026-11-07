import { rangeToOffsets } from "../../App/rangeToOffsets";

type Span = { start: number; end: number };

export function commentAtTap<T extends Span>(
	content: HTMLElement | null,
	target: EventTarget,
	comments: T[],
): T | null {
	const mark =
		target instanceof Element ? target.closest("mark.pr-comment") : null;
	if (!content || !mark || !content.contains(mark)) return null;
	const range = document.createRange();
	range.selectNodeContents(mark);
	const { start } = rangeToOffsets(content, range);
	return comments.find((c) => c.start <= start && start < c.end) ?? null;
}
