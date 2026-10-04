import type { Chord } from "../../../../chordKeys";

export function navTabChord(
	navTabChords: readonly Chord[],
	index: number,
): Chord {
	return [...navTabChords[0].slice(0, -1), String(index + 1)];
}
