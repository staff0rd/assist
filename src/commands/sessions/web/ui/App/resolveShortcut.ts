import type { HotkeyBindings } from "../../../../../shared/hotkeys/defaultHotkeys";
import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import { parseChord } from "../../../../../shared/hotkeys/parseChord";
import { matchesChord } from "./matchesChord";
import { navTabIndex } from "./navTabIndex";
import { isCycleCardKey } from "./isCycleCardKey";
import {
	type Shortcut,
	type ShortcutName,
	shortcutRegistry,
} from "./shortcutRegistry";

const NAV_TAB_DIGITS = "1–5";
const resolved = new WeakMap<HotkeyBindings, Map<ShortcutName, Shortcut>>();

export function resolveShortcut(
	name: ShortcutName,
	bindings: HotkeyBindings,
): Shortcut {
	let byName = resolved.get(bindings);
	if (!byName) {
		byName = new Map();
		resolved.set(bindings, byName);
	}
	let shortcut = byName.get(name);
	if (!shortcut) {
		shortcut = buildShortcut(name, bindings);
		byName.set(name, shortcut);
	}
	return shortcut;
}

function buildShortcut(name: ShortcutName, bindings: HotkeyBindings): Shortcut {
	const { label, group } = shortcutRegistry[name];
	if (name === "cycleCards")
		return {
			label,
			group,
			chords: [["Tab"], ["Shift", "Tab"]],
			bound: [],
			matches: isCycleCardKey,
		};
	const modifiersOnly = name === "navTab";
	const bound = bindings[name].flatMap((text) => {
		const parsed = parseChord(text, { modifiersOnly });
		return parsed.ok ? [parsed.chord] : [];
	});
	return {
		label,
		group,
		chords: bound.map((chord) => displayChord(chord)),
		bound,
		matches: modifiersOnly
			? (event) => navTabIndex(event, bound) !== undefined
			: (event) => bound.some((chord) => matchesChord(chord, event)),
	};
}

function displayChord({ modifiers, key }: HotkeyChord): string[] {
	return [...modifiers, key?.label ?? NAV_TAB_DIGITS];
}
