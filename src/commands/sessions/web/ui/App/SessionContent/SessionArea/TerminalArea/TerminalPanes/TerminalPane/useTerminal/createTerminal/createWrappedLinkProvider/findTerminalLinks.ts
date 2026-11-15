// consider everything starting with http:// or https:// up to the first
// whitespace, `"` or `'` as a url, excluding trailing interpunction/brackets.
// ported from @xterm/addon-web-links so single-line detection is unchanged.
export const strictUrlRegex =
	/(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\^<>`]*[^\s"':,.!?{}|\\^~[\]`()<>]/;

import { logicalRows } from "./logicalRows";
import type { GetLine } from "./rowSegments";

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
	const { start, texts } = logicalRows(getLine, y - 1);
	return matchLinks(texts, start, regex);
}
