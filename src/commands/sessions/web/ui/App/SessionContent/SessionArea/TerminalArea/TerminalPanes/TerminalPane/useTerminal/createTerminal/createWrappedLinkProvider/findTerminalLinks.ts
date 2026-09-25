// consider everything starting with http:// or https:// up to the first
// whitespace, `"` or `'` as a url, excluding trailing interpunction/brackets.
// ported from @xterm/addon-web-links so single-line detection is unchanged.
export const strictUrlRegex =
	/(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\^<>`]*[^\s"':,.!?{}|\\^~[\]`()<>]/;

// cap the join span; a url wrapping across more rows than this is implausible.
const MAX_LINES = 64;

export type BufferLineInfo = {
	/** the line's visible text, trailing blanks trimmed (translateToString(true)). */
	text: string;
	/** xterm marked this line a soft-wrap continuation of the line above. */
	isWrapped: boolean;
	/** the line's content reached the right margin, so the next line continues it. */
	isFull: boolean;
};

type GetLine = (index: number) => BufferLineInfo | undefined;
type CellPosition = { x: number; y: number };
type DetectedLink = {
	text: string;
	range: { start: CellPosition; end: CellPosition };
};

function isUrl(text: string): boolean {
	try {
		return !!new URL(text).host;
	} catch {
		return false;
	}
}

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

/** Map a joined-string index to its 1-based cell position within the logical line. */
function mapIndex(
	texts: string[],
	start: number,
	index: number,
): CellPosition | undefined {
	let row = start;
	for (const text of texts) {
		if (index < text.length) return { x: index + 1, y: row + 1 };
		index -= text.length;
		row++;
	}
	return undefined;
}

function toLink(
	texts: string[],
	start: number,
	match: RegExpExecArray,
): DetectedLink | undefined {
	const text = match[0];
	const from = mapIndex(texts, start, match.index);
	const to = mapIndex(texts, start, match.index + text.length - 1);
	if (!isUrl(text) || !from || !to) return undefined;
	return { text, range: { start: from, end: to } };
}

function matchLinks(
	texts: string[],
	start: number,
	regex: RegExp,
): DetectedLink[] {
	const rex = new RegExp(regex.source, `${regex.flags || ""}g`);
	const matches = [...texts.join("").matchAll(rex)];
	return matches.flatMap((m) => toLink(texts, start, m) ?? []);
}

/**
 * Detect urls on the logical line containing buffer line `y` (1-based), joining
 * wrapped and margin-filled continuation lines so a url spanning several
 * terminal rows is returned as a single link with a range covering every row.
 */
export function findTerminalLinks(
	getLine: GetLine,
	y: number,
	regex: RegExp = strictUrlRegex,
): DetectedLink[] {
	if (!getLine(y - 1)) return [];
	let start = y - 1;
	while (start > 0 && continuesInto(getLine, start - 1)) start--;
	return matchLinks(collectTexts(getLine, start), start, regex);
}
