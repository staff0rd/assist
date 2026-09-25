export type QuoteLines = { start: number; end: number };

type Normalized = { text: string; offsets: number[] };

function isSpace(char: string): boolean {
	return char === " " || char === "\n" || char === "\t" || char === "\r";
}

function collapseWhitespace(text: string): Normalized {
	const chars: string[] = [];
	const offsets: number[] = [];
	let gap = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i] as string;
		if (isSpace(char)) {
			gap = chars.length > 0;
			continue;
		}
		if (gap) {
			chars.push(" ");
			offsets.push(i);
			gap = false;
		}
		chars.push(char);
		offsets.push(i);
	}
	return { text: chars.join(""), offsets };
}

function lineAt(source: string, index: number): number {
	let line = 1;
	for (let i = 0; i < index; i++) if (source[i] === "\n") line++;
	return line;
}

export function locateQuoteLines(
	source: string,
	quote: string,
): QuoteLines | null {
	const needle = collapseWhitespace(quote).text;
	if (!needle) return null;
	const haystack = collapseWhitespace(source);
	const at = haystack.text.indexOf(needle);
	if (at === -1) return null;
	const start = haystack.offsets[at] as number;
	const end = haystack.offsets[at + needle.length - 1] as number;
	return { start: lineAt(source, start), end: lineAt(source, end) };
}
