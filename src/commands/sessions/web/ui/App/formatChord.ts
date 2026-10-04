import { type Chord, chordKeys } from "./chordKeys";
import { isMacPlatform } from "./isMacPlatform";

export function formatChord(chord: Chord, mac = isMacPlatform()): string {
	return chordKeys(chord, mac).join(mac ? "" : "+");
}
