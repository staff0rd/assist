import { continuesHardWrap } from "./continuesHardWrap";
import {
	type GetLine,
	MAX_LINES,
	rowSegments,
	type Segment,
} from "./rowSegments";

type Segments = ReturnType<typeof rowSegments>;

function hardWrapped(
	segments: Segments,
	above: Segment,
	below: Segment,
): boolean {
	const before = segments.before(above);
	return continuesHardWrap(
		before?.texts.join(""),
		above.texts.join(""),
		below.texts.join(""),
	);
}

function joinHardWrapped(segments: Segments, seg: Segment): Segment[] {
	const segs = [seg];
	let prev = segments.before(seg);
	while (
		prev &&
		segs.length < MAX_LINES &&
		hardWrapped(segments, prev, segs[0])
	) {
		segs.unshift(prev);
		prev = segments.before(prev);
	}
	let next = segments.after(seg);
	while (
		next &&
		segs.length < MAX_LINES &&
		hardWrapped(segments, segs[segs.length - 1], next)
	) {
		segs.push(next);
		next = segments.after(next);
	}
	return segs;
}

export function logicalRows(
	getLine: GetLine,
	index: number,
): { start: number; texts: string[] } {
	const segments = rowSegments(getLine);
	const segs = joinHardWrapped(segments, segments.endingAt(index));
	return {
		start: segs[0]?.start ?? index,
		texts: segs.flatMap((seg) => seg.texts),
	};
}
