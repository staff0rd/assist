import { isNewSessionKey } from "./shortcutRegistry/isNewSessionKey";
import { isQuickOpenKey } from "./shortcutRegistry/isQuickOpenKey";
import { isNextWaitingKey } from "./shortcutRegistry/isNextWaitingKey";
import { isSaveKey } from "./shortcutRegistry/isSaveKey";
import type { Chord } from "./chordKeys";
import { isCycleCardKey } from "./shortcutRegistry/isCycleCardKey";
import { isShortcutsSheetKey } from "./shortcutRegistry/isShortcutsSheetKey";
import { navTabIndex } from "./navTabIndex";
import { altChordCode } from "./altChordCode";

export type Shortcut = {
	label: string;
	group: string;
	chords: readonly Chord[];
	matches: (event: KeyboardEvent) => boolean;
};

export const shortcutRegistry = {
	navTab: {
		label: "Switch top-level tab",
		group: "Navigate",
		chords: [["Alt", "1–5"]],
		matches: (event) => navTabIndex(event) !== undefined,
	},
	focusSidebar: {
		label: "Focus sidebar",
		group: "Navigate",
		chords: [["Alt", "A"]],
		matches: (event) => altChordCode(event) === "KeyA",
	},
	focusTerminal: {
		label: "Focus terminal",
		group: "Navigate",
		chords: [["Alt", "S"]],
		matches: (event) => altChordCode(event) === "KeyS",
	},
	toggleDiff: {
		label: "Open / close diff panel",
		group: "Navigate",
		chords: [["Alt", "D"]],
		matches: (event) => altChordCode(event) === "KeyD",
	},
	openConfig: {
		label: "Open config",
		group: "Navigate",
		chords: [["Alt", "X"]],
		matches: (event) => altChordCode(event) === "KeyX",
	},
	openMenu: {
		label: "Open menu",
		group: "Navigate",
		chords: [["Alt", "C"]],
		matches: (event) => altChordCode(event) === "KeyC",
	},
	cycleCards: {
		label: "Next / previous sidebar card",
		group: "Navigate",
		chords: [["Tab"], ["Shift", "Tab"]],
		matches: isCycleCardKey,
	},
	nextWaiting: {
		label: "Next waiting session",
		group: "Sessions",
		chords: [["Ctrl", "."]],
		matches: isNextWaitingKey,
	},
	newSession: {
		label: "New session",
		group: "Sessions",
		chords: [
			["Ctrl", "N"],
			["Alt", "N"],
		],
		matches: isNewSessionKey,
	},
	quickOpen: {
		label: "Quick open file",
		group: "Files",
		chords: [["Ctrl", "P"]],
		matches: isQuickOpenKey,
	},
	save: {
		label: "Save file",
		group: "Files",
		chords: [["Ctrl", "S"]],
		matches: isSaveKey,
	},
	shortcutsSheet: {
		label: "Keyboard shortcuts",
		group: "Help",
		chords: [["Mod", "/"]],
		matches: isShortcutsSheetKey,
	},
} satisfies Record<string, Shortcut>;
