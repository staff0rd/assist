import { cleanText } from "../../../../cleanText";
import type { VttCue } from "../../../../types";
import { removeSubstringDuplicates } from "./removeSubstringDuplicates";

function findWordOverlap(currentWords: string[], nextWords: string[]): number {
	for (let j = Math.min(5, currentWords.length); j >= 1; j--) {
		const suffix = currentWords.slice(-j).join(" ");
		const prefix = nextWords.slice(0, j).join(" ");
		if (suffix === prefix) return j;
	}
	return 0;
}

function joinWithOverlap(currentText: string, nextText: string): string {
	const currentWords = currentText.toLowerCase().split(/\s+/);
	const nextWords = nextText.toLowerCase().split(/\s+/);
	const overlapIndex = findWordOverlap(currentWords, nextWords);
	if (overlapIndex > 0) {
		return `${currentText} ${nextText.split(/\s+/).slice(overlapIndex).join(" ")}`;
	}
	return currentText.includes(nextText)
		? currentText
		: `${currentText} ${nextText}`;
}

function canMergeCues(current: VttCue, next: VttCue): boolean {
	return (
		current.speaker === next.speaker && next.startMs <= current.endMs + 500
	);
}

function mergeOverlappingCues(cues: VttCue[]): VttCue[] {
	if (cues.length === 0) return [];

	const result: VttCue[] = [];
	let current = { ...cues[0] };

	for (let i = 1; i < cues.length; i++) {
		if (canMergeCues(current, cues[i])) {
			current.text = joinWithOverlap(current.text, cues[i].text);
			current.endMs = Math.max(current.endMs, cues[i].endMs);
		} else {
			result.push(current);
			current = { ...cues[i] };
		}
	}

	result.push(current);
	return result;
}

export function deduplicateCues(cues: VttCue[]): VttCue[] {
	if (cues.length === 0) return [];

	const sorted = [...cues].sort((a, b) => a.startMs - b.startMs);
	const withoutSubstrings = removeSubstringDuplicates(sorted);
	const merged = mergeOverlappingCues(withoutSubstrings);

	return merged.map((cue) => ({
		...cue,
		text: cleanText(cue.text),
	}));
}
