import { commentColor } from "./commentColor";

type Span = { start: number; end: number };
type ColoredOffsets = { start: number; end: number; color: string };

export function previewHighlights(comments: Span[], pending: Span | null) {
	const commentColors = comments.map((_, i) => commentColor(i).solid);
	const dragColor = commentColor(comments.length).fill;

	const ranges: ColoredOffsets[] = comments.map((c, i) => ({
		start: c.start,
		end: c.end,
		color: commentColor(i).fill,
	}));
	if (pending)
		ranges.push({ start: pending.start, end: pending.end, color: dragColor });

	return { commentColors, dragColor, ranges };
}
