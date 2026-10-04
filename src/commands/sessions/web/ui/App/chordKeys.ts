import { isMacPlatform } from "./isMacPlatform";

export type Chord = readonly string[];

const MAC_GLYPHS: Record<string, string> = {
	Ctrl: "⌃",
	Alt: "⌥",
	Shift: "⇧",
	Mod: "⌘",
};
const OTHER_GLYPHS: Record<string, string> = { Mod: "Ctrl" };

export function chordKeys(chord: Chord, mac = isMacPlatform()): string[] {
	const glyphs = mac ? MAC_GLYPHS : OTHER_GLYPHS;
	return chord.map((key) => glyphs[key] ?? key);
}
