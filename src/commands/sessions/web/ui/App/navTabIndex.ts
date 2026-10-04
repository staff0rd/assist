import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import { matchesChord } from "./matchesChord";

const NAV_TAB_DIGIT = /^Digit([1-5])$/;

export function navTabIndex(
	event: KeyboardEvent,
	modifiers: readonly HotkeyChord[],
): number | undefined {
	if (!modifiers.some((chord) => matchesChord(chord, event))) return undefined;
	const match = NAV_TAB_DIGIT.exec(event.code);
	return match ? Number(match[1]) - 1 : undefined;
}
