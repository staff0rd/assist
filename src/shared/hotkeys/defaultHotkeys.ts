export const defaultHotkeys = {
	navTab: ["Alt"],
	focusSidebar: ["Alt+A"],
	focusTerminal: ["Alt+S"],
	toggleDiff: ["Alt+D"],
	focusRepoPicker: ["Alt+R"],
	openConfig: ["Alt+W"],
	openMenu: ["Alt+E"],
	focusAddAgent: ["Alt+Z"],
	focusVsCode: ["Alt+X"],
	focusDone: ["Alt+C"],
	nextWaiting: ["Mod+."],
	newSession: ["Mod+N", "Alt+N"],
	quickOpen: ["Mod+P"],
	save: ["Mod+S"],
	shortcutsSheet: ["Mod+/"],
} satisfies Record<string, readonly string[]>;

export type HotkeyName = keyof typeof defaultHotkeys;

export type HotkeyBindings = Record<HotkeyName, readonly string[]>;
