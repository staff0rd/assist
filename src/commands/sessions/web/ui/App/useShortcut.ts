import { resolveShortcut } from "./resolveShortcut";
import type { Shortcut, ShortcutName } from "./shortcutRegistry";
import { useHotkeyBindings } from "./useHotkeyBindings";

export function useShortcut(name: ShortcutName): Shortcut {
	return resolveShortcut(name, useHotkeyBindings());
}
