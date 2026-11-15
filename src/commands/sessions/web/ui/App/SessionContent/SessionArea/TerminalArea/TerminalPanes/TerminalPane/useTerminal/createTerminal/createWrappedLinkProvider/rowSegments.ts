// cap the join span; a url wrapping across more rows than this is implausible.
export const MAX_LINES = 64;

export type BufferLineInfo = {
	/** the line's visible text, trailing blanks trimmed (translateToString(true)). */
	text: string;
	/** xterm marked this line a soft-wrap continuation of the line above. */
	isWrapped: boolean;
	/** the line's content reached the right margin, so the next line continues it. */
	isFull: boolean;
};

export type GetLine = (index: number) => BufferLineInfo | undefined;
export type Segment = { start: number; texts: string[] };

/* why: xterm only flags soft-wrapped continuations with isWrapped, but the pty is
   pinned to 120 cols while the browser terminal fits its own width, so programs
   that wrap their own output to 120 produce continuation lines that fill the
   margin without an isWrapped flag (#434). Treat a line that reaches the margin
   as continued too, so the whole url joins into one link. */
function continuesInto(getLine: GetLine, index: number): boolean {
	const line = getLine(index);
	const next = getLine(index + 1);
	return !!line && !!next && (next.isWrapped || line.isFull);
}

/** Collect the visible text of each line of the logical line beginning at `start`. */
function collectTexts(getLine: GetLine, start: number): string[] {
	const texts: string[] = [];
	for (let i = start; i - start < MAX_LINES; i++) {
		const line = getLine(i);
		if (!line) break;
		texts.push(line.text);
		if (!continuesInto(getLine, i)) break;
	}
	return texts;
}

function segmentFrom(getLine: GetLine, start: number): Segment {
	return { start, texts: collectTexts(getLine, start) };
}

function segmentEndingAt(getLine: GetLine, index: number): Segment {
	let start = index;
	while (start > 0 && continuesInto(getLine, start - 1)) start--;
	return segmentFrom(getLine, start);
}

function segmentBefore(getLine: GetLine, seg: Segment): Segment | undefined {
	if (seg.start === 0 || !getLine(seg.start - 1)) return undefined;
	return segmentEndingAt(getLine, seg.start - 1);
}

function segmentAfter(getLine: GetLine, seg: Segment): Segment | undefined {
	const next = seg.start + seg.texts.length;
	return getLine(next) ? segmentFrom(getLine, next) : undefined;
}

export function rowSegments(getLine: GetLine) {
	return {
		endingAt: (index: number) => segmentEndingAt(getLine, index),
		before: (seg: Segment) => segmentBefore(getLine, seg),
		after: (seg: Segment) => segmentAfter(getLine, seg),
	};
}
