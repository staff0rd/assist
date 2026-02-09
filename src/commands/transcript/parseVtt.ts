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

export { cleanText } from "./cleanText";
export { deduplicateCues } from "./deduplicateCues";
