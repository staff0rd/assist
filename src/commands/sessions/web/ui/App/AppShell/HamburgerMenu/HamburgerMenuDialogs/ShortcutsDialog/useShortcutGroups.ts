import { resolveShortcut } from "../../../../resolveShortcut";
import {
	type ShortcutName,
	shortcutRegistry,
} from "../../../../shortcutRegistry";
import { useHotkeyBindings } from "../../../../useHotkeyBindings";
import { groupShortcuts } from "./useShortcutGroups/groupShortcuts";

const names = Object.keys(shortcutRegistry) as ShortcutName[];

export function useShortcutGroups(): ReturnType<typeof groupShortcuts> {
	const bindings = useHotkeyBindings();
	return groupShortcuts(names.map((name) => resolveShortcut(name, bindings)));
}
