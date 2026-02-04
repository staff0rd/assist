import type { VttCue } from "./types";

function parseTimestamp(ts: string): number {
	const parts = ts.split(":");
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	if (parts.length === 3) {
		hours = Number.parseInt(parts[0], 10);
		minutes = Number.parseInt(parts[1], 10);
		seconds = Number.parseFloat(parts[2]);
	} else if (parts.length === 2) {
		minutes = Number.parseInt(parts[0], 10);
		seconds = Number.parseFloat(parts[1]);
	}

	return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
}

export function parseVtt(content: string): VttCue[] {
	const cues: VttCue[] = [];
	const lines = content.split(/\r?\n/);

	let i = 0;
	while (i < lines.length && !lines[i].includes("-->")) {
		i++;
	}

	while (i < lines.length) {
		const line = lines[i].trim();

		if (line.includes("-->")) {
			const [startStr, endStr] = line.split("-->").map((s) => s.trim());
			const startMs = parseTimestamp(startStr);
			const endMs = parseTimestamp(endStr);

			const textLines: string[] = [];
			i++;
			while (i < lines.length && lines[i].trim() && !lines[i].includes("-->")) {
				textLines.push(lines[i].trim());
				i++;
			}

			const fullText = textLines.join(" ");

			const speakerMatch = fullText.match(/^<v\s+([^>]+)>/);
			let speaker: string | null = null;
			let text = fullText;

			if (speakerMatch) {
				speaker = speakerMatch[1];
				text = fullText.replace(/<v\s+[^>]+>/, "").trim();
			}

			if (text) {
				cues.push({ startMs, endMs, speaker, text });
			}
		} else {
			i++;
		}
	}

	return cues;
}

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

			let overlapIndex = -1;
			for (let j = Math.min(5, currentWords.length); j >= 1; j--) {
				const suffix = currentWords.slice(-j).join(" ");
				const prefix = nextWords.slice(0, j).join(" ");
				if (suffix === prefix) {
					overlapIndex = j;
					break;
				}
			}

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

export function cleanText(text: string): string {
	const words = text.split(/\s+/);
	const cleaned: string[] = [];

	for (let i = 0; i < words.length; i++) {
		let isRepeat = false;

		for (let len = 3; len <= 8 && i + len <= words.length; len++) {
			const phrase = words
				.slice(i, i + len)
				.join(" ")
				.toLowerCase();
			const remaining = words
				.slice(i + len)
				.join(" ")
				.toLowerCase();

			if (remaining.startsWith(phrase)) {
				isRepeat = true;
				break;
			}
		}

		if (!isRepeat) {
			cleaned.push(words[i]);
		}
	}

	return cleaned.join(" ").replace(/\s+/g, " ").trim();
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
