import { isNewSessionKey } from "./shortcutRegistry/isNewSessionKey";
import { isQuickOpenKey } from "./shortcutRegistry/isQuickOpenKey";
import { isNextWaitingKey } from "./shortcutRegistry/isNextWaitingKey";
import { isSaveKey } from "./shortcutRegistry/isSaveKey";
import type { Chord } from "./chordKeys";
import { isCycleCardKey } from "./shortcutRegistry/isCycleCardKey";
import { isShortcutsSheetKey } from "./shortcutRegistry/isShortcutsSheetKey";
import { navTabIndex } from "./navTabIndex";
import { altLetterShortcut } from "./shortcutRegistry/altLetterShortcut";

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
	focusSidebar: altLetterShortcut("Focus sidebar", "Navigate", "A"),
	focusTerminal: altLetterShortcut("Focus terminal", "Navigate", "S"),
	toggleDiff: altLetterShortcut(
		"Open / close diff panel, or focus preview pane",
		"Navigate",
		"D",
	),
	focusRepoPicker: altLetterShortcut("Focus repo picker", "Navigate", "R"),
	openConfig: altLetterShortcut("Open config", "Navigate", "W"),
	openMenu: altLetterShortcut("Open menu", "Navigate", "E"),
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
	focusAddAgent: altLetterShortcut("Focus add agent", "Sessions", "Z"),
	focusVsCode: altLetterShortcut("Focus VS Code", "Sessions", "X"),
	focusDone: altLetterShortcut("Focus done", "Sessions", "C"),
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

export type ShortcutName = keyof typeof shortcutRegistry;
