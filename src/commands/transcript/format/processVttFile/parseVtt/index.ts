import type { VttCue } from "../../../types";

function parseHMS(h: string, m: string, s: string): number {
	return (
		Number.parseInt(h, 10) * 3600 +
		Number.parseInt(m, 10) * 60 +
		Number.parseFloat(s)
	);
}

function parseMS(m: string, s: string): number {
	return Number.parseInt(m, 10) * 60 + Number.parseFloat(s);
}

function toSeconds(parts: string[]): number {
	if (parts.length === 3) return parseHMS(parts[0], parts[1], parts[2]);
	if (parts.length === 2) return parseMS(parts[0], parts[1]);
	return 0;
}

function parseTimestamp(ts: string): number {
	return Math.round(toSeconds(ts.split(":")) * 1000);
}

function extractSpeaker(fullText: string): {
	speaker: string | null;
	text: string;
} {
	const match = fullText.match(/^<v\s+([^>]+)>/);
	if (!match) return { speaker: null, text: fullText };
	return {
		speaker: match[1],
		text: fullText.replace(/<v\s+[^>]+>/, "").trim(),
	};
}

function isTextLine(line: string): boolean {
	return !!line.trim() && !line.includes("-->");
}

function scanTextLines(
	lines: string[],
	start: number,
): { texts: string[]; end: number } {
	let i = start;
	while (i < lines.length && isTextLine(lines[i])) i++;
	return { texts: lines.slice(start, i).map((l) => l.trim()), end: i };
}

function collectTextLines(
	lines: string[],
	startIndex: number,
): { text: string; nextIndex: number } {
	const { texts, end } = scanTextLines(lines, startIndex);
	return { text: texts.join(" "), nextIndex: end };
}

function parseTimestampLine(line: string): { startMs: number; endMs: number } {
	const [startStr, endStr] = line
		.trim()
		.split("-->")
		.map((s) => s.trim());
	return { startMs: parseTimestamp(startStr), endMs: parseTimestamp(endStr) };
}

function buildCue(
	startMs: number,
	endMs: number,
	fullText: string,
): VttCue | null {
	const { speaker, text } = extractSpeaker(fullText);
	return text ? { startMs, endMs, speaker, text } : null;
}

function parseCueLine(
	lines: string[],
	i: number,
): { cue: VttCue | null; nextIndex: number } {
	const { startMs, endMs } = parseTimestampLine(lines[i]);
	const { text, nextIndex } = collectTextLines(lines, i + 1);
	return { cue: buildCue(startMs, endMs, text), nextIndex };
}

function isCueSeparator(line: string): boolean {
	return line.trim().includes("-->");
}

function skipHeader(lines: string[]): number {
	let i = 0;
	while (i < lines.length && !isCueSeparator(lines[i])) i++;
	return i;
}

function processLine(cues: VttCue[], lines: string[], i: number): number {
	if (!isCueSeparator(lines[i])) return i + 1;
	const { cue, nextIndex } = parseCueLine(lines, i);
	if (cue) cues.push(cue);
	return nextIndex;
}

export function parseVtt(content: string): VttCue[] {
	const cues: VttCue[] = [];
	const lines = content.split(/\r?\n/);
	let i = skipHeader(lines);
	while (i < lines.length) i = processLine(cues, lines, i);
	return cues;
}

export { cleanText } from "../../../cleanText";
export { deduplicateCues } from "./deduplicateCues";
