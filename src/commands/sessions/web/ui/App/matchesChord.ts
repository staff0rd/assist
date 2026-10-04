import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import { isMacPlatform } from "./isMacPlatform";

export function matchesChord(
	{ modifiers, key }: HotkeyChord,
	event: KeyboardEvent,
	mac = isMacPlatform(),
): boolean {
	if (event.type !== "keydown") return false;
	if (key && event.code !== key.code) return false;
	const mod = modifiers.includes("Mod");
	return (
		event.ctrlKey === (modifiers.includes("Ctrl") || (mod && !mac)) &&
		event.metaKey === (modifiers.includes("Meta") || (mod && mac)) &&
		event.altKey === modifiers.includes("Alt") &&
		event.shiftKey === modifiers.includes("Shift")
	);
}
