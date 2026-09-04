import type { VttCue, VttPassage } from "../types";

function pad(value: number, width: number): string {
	return String(value).padStart(width, "0");
}

function formatTimestamp(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms % 1000, 3)}`;
}

function formatCue(cue: VttCue): string {
	const timing = `${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}`;
	const text = cue.speaker ? `<v ${cue.speaker}>${cue.text}` : cue.text;
	return `${timing}\n${text}`;
}

function formatClock(ms: number): string {
	return formatTimestamp(ms).slice(0, 8);
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
