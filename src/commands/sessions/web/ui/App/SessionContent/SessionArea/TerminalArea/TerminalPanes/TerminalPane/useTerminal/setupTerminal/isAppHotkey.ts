import { hotkeyBindingsStore } from "../../../../../../../hotkeyBindingsStore";
import { resolveShortcut } from "../../../../../../../resolveShortcut";
import type { ShortcutName } from "../../../../../../../shortcutRegistry";

const APP_HOTKEYS: ShortcutName[] = [
	"quickOpen",
	"newSession",
	"navTab",
	"shortcutsSheet",
	"focusSidebar",
	"focusTerminal",
	"toggleDiff",
	"openConfig",
	"openMenu",
	"focusRepoPicker",
	"focusAddAgent",
	"focusVsCode",
	"focusDone",
];

export function isAppHotkey(event: KeyboardEvent): boolean {
	const bindings = hotkeyBindingsStore.get();
	return APP_HOTKEYS.some((name) =>
		resolveShortcut(name, bindings).matches(event),
	);
}
