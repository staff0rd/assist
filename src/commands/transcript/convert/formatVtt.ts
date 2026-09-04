import type { VttCue, VttPassage } from "../types";
import { formatClock, formatTimestamp } from "./formatTimestamp";

function formatCue(cue: VttCue): string {
	const timing = `${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}`;
	const text = cue.speaker ? `<v ${cue.speaker}>${cue.text}` : cue.text;
	return `${timing}\n${text}`;
}

function formatNoteBlock(lines: string[]): string[] {
	return lines.length ? [lines.map((line) => `NOTE ${line}`).join("\n")] : [];
}

function formatPassage(passage: VttPassage): string[] {
	return [
		`NOTE source: ${passage.source} @ ${formatClock(passage.sourceStartMs)}`,
		...passage.cues.map(formatCue),
	];
}

export function formatVtt(cues: VttCue[]): string {
	return ["WEBVTT", ...cues.map(formatCue)].join("\n\n");
}

export function formatVttPassages(
	passages: VttPassage[],
	notes: string[] = [],
): string {
	return [
		"WEBVTT",
		...formatNoteBlock(notes),
		...passages.flatMap(formatPassage),
	].join("\n\n");
}
