import type { ConfigHelpEntry } from "../../shared/configHelp";
import {
	defaultHotkeys,
	type HotkeyName,
} from "../../shared/hotkeys/defaultHotkeys";

const ACTIONS: Record<HotkeyName, string> = {
	navTab:
		"modifier for the top-level tab digits 1–N (modifiers only, e.g. Ctrl+Alt)",
	focusSidebar: "focus the active sidebar card",
	focusTerminal: "focus the active terminal",
	toggleDiff: "open / close the diff panel, or focus the preview pane",
	focusRepoPicker: "focus the toolbar repo picker",
	openConfig: "open the config page",
	openMenu: "open the hamburger menu",
	focusAddAgent: "focus the top bar's add agent button",
	focusVsCode: "focus the top bar's VS Code button",
	focusDone: "focus the top bar's done button",
	nextWaiting: "jump to the next waiting session",
	newSession: "open the new-session dialog",
	quickOpen: "quick open a file",
	save: "save the open file",
	shortcutsSheet: "show the keyboard shortcuts sheet",
};

const EXAMPLES: Partial<Record<HotkeyName, string>> = {
	navTab: "Ctrl+Alt",
	focusTerminal: "Ctrl+Alt+J",
};

export const hotkeysConfigHelp: ConfigHelpEntry[] = (
	Object.keys(ACTIONS) as HotkeyName[]
).map((name) => ({
	key: `sessions.hotkeys.${name}`,
	setter: `assist config set sessions.hotkeys.${name} ${EXAMPLES[name] ?? defaultHotkeys[name][0]} -g`,
	note: `${ACTIONS[name]}; default ${defaultHotkeys[name].join(" / ")}`,
}));
