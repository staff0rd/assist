import { shortcutRegistry } from "../../../../../../../shortcutRegistry";

const APP_HOTKEYS = [
	shortcutRegistry.quickOpen,
	shortcutRegistry.newSession,
	shortcutRegistry.navTab,
	shortcutRegistry.shortcutsSheet,
];

export function isAppHotkey(event: KeyboardEvent): boolean {
	return APP_HOTKEYS.some((shortcut) => shortcut.matches(event));
}
