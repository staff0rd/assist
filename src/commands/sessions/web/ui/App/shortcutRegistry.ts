import type { HotkeyChord } from "../../../../../shared/hotkeys/HotkeyChord";
import type { HotkeyName } from "../../../../../shared/hotkeys/defaultHotkeys";
import type { Chord } from "./chordKeys";

export type Shortcut = {
	label: string;
	group: string;
	chords: readonly Chord[];
	bound: readonly HotkeyChord[];
	matches: (event: KeyboardEvent) => boolean;
};

export const shortcutRegistry = {
	navTab: { label: "Switch top-level tab", group: "Navigate" },
	focusSidebar: {
		label: "Focus sidebar (backlog: last-selected session card)",
		group: "Navigate",
	},
	focusTerminal: {
		label: "Focus terminal (backlog: search / back)",
		group: "Navigate",
	},
	toggleDiff: {
		label: "Open / close diff panel, or focus preview pane",
		group: "Navigate",
	},
	focusRepoPicker: { label: "Focus repo picker", group: "Navigate" },
	openConfig: { label: "Open config", group: "Navigate" },
	openMenu: { label: "Open menu", group: "Navigate" },
	cycleCards: { label: "Next / previous sidebar card", group: "Navigate" },
	nextWaiting: { label: "Next waiting session", group: "Sessions" },
	focusAddAgent: { label: "Focus add agent", group: "Sessions" },
	focusVsCode: { label: "Focus VS Code", group: "Sessions" },
	focusDone: { label: "Focus done", group: "Sessions" },
	newSession: { label: "New session", group: "Sessions" },
	quickOpen: { label: "Quick open file", group: "Files" },
	save: { label: "Save file", group: "Files" },
	shortcutsSheet: { label: "Keyboard shortcuts", group: "Help" },
} satisfies Record<
	HotkeyName | "cycleCards",
	Pick<Shortcut, "label" | "group">
>;

export type ShortcutName = keyof typeof shortcutRegistry;
