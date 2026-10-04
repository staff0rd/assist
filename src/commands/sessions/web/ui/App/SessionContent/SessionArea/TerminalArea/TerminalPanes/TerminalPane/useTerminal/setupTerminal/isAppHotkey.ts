import { shortcutRegistry } from "../../../../../../../shortcutRegistry";

const APP_HOTKEYS = [
	shortcutRegistry.quickOpen,
	shortcutRegistry.newSession,
	shortcutRegistry.navTab,
	shortcutRegistry.shortcutsSheet,
	shortcutRegistry.focusSidebar,
	shortcutRegistry.focusTerminal,
	shortcutRegistry.toggleDiff,
	shortcutRegistry.openConfig,
	shortcutRegistry.openMenu,
	shortcutRegistry.focusRepoPicker,
	shortcutRegistry.focusAddAgent,
	shortcutRegistry.focusVsCode,
	shortcutRegistry.focusDone,
];

export function isAppHotkey(event: KeyboardEvent): boolean {
	return APP_HOTKEYS.some((shortcut) => shortcut.matches(event));
}
