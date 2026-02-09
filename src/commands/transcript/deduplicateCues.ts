import { cleanText } from "./cleanText";
import type { VttCue } from "./types";

function removeSubstringDuplicates(cues: VttCue[]): VttCue[] {
	const toRemove = new Set<number>();

	for (let i = 0; i < cues.length; i++) {
		if (toRemove.has(i)) continue;

		for (let j = i + 1; j < cues.length; j++) {
			if (toRemove.has(j)) continue;

			if (cues[j].startMs - cues[i].endMs > 10000) break;

			if (cues[i].speaker !== cues[j].speaker) continue;

			const textI = cues[i].text.toLowerCase().trim();
			const textJ = cues[j].text.toLowerCase().trim();

			if (textI.includes(textJ) && textI.length > textJ.length) {
				toRemove.add(j);
			} else if (textJ.includes(textI) && textJ.length > textI.length) {
				toRemove.add(i);
				break;
			}
		}
	}

	return cues.filter((_, i) => !toRemove.has(i));
}

function findWordOverlap(currentWords: string[], nextWords: string[]): number {
	for (let j = Math.min(5, currentWords.length); j >= 1; j--) {
		const suffix = currentWords.slice(-j).join(" ");
		const prefix = nextWords.slice(0, j).join(" ");
		if (suffix === prefix) {
			return j;
		}
	}
	return 0;
}

function mergeOverlappingCues(cues: VttCue[]): VttCue[] {
	if (cues.length === 0) return [];

	const result: VttCue[] = [];
	let current = { ...cues[0] };

	for (let i = 1; i < cues.length; i++) {
		const next = cues[i];

		const overlaps = next.startMs <= current.endMs + 500;
		const sameSpeaker = current.speaker === next.speaker;

		if (sameSpeaker && overlaps) {
			const currentWords = current.text.toLowerCase().split(/\s+/);
			const nextWords = next.text.toLowerCase().split(/\s+/);
			const overlapIndex = findWordOverlap(currentWords, nextWords);

			if (overlapIndex > 0) {
				const nextOriginalWords = next.text.split(/\s+/);
				current.text = `${current.text} ${nextOriginalWords.slice(overlapIndex).join(" ")}`;
			} else if (!current.text.includes(next.text)) {
				current.text = `${current.text} ${next.text}`;
			}

			current.endMs = Math.max(current.endMs, next.endMs);
		} else {
			result.push(current);
			current = { ...next };
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
