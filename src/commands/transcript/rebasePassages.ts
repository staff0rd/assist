import type { VttCue, VttPassage } from "./types";

const JOIN_GAP_MS = 1000;

export function rebasePassages(passages: VttPassage[]): VttPassage[] {
	let cursorMs = 0;
	return passages.map((passage) => {
		const cues = shift(passage.cues, cursorMs - passage.sourceStartMs);
		cursorMs = lastEndMs(cues) + JOIN_GAP_MS;
		return { ...passage, cues };
	});
}

function shift(cues: VttCue[], offsetMs: number): VttCue[] {
	return cues.map((cue) => ({
		...cue,
		startMs: cue.startMs + offsetMs,
		endMs: cue.endMs + offsetMs,
	}));
}

function lastEndMs(cues: VttCue[]): number {
	return Math.max(...cues.map((cue) => cue.endMs));
}
