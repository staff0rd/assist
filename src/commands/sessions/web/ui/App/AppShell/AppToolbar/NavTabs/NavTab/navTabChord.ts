import type { Chord } from "../../../../chordKeys";
import { shortcutRegistry } from "../../../../shortcutRegistry";

export function navTabChord(index: number): Chord {
	const [modifier] = shortcutRegistry.navTab.chords[0];
	return [modifier, String(index + 1)];
}
