import type { Shortcut } from "../../../../../shortcutRegistry";

type ShortcutGroup = { name: string; shortcuts: Shortcut[] };

export function groupShortcuts(
	shortcuts: readonly Shortcut[],
): ShortcutGroup[] {
	const groups = new Map<string, Shortcut[]>();
	for (const shortcut of shortcuts) {
		const group = groups.get(shortcut.group) ?? [];
		group.push(shortcut);
		groups.set(shortcut.group, group);
	}
	return [...groups].map(([name, entries]) => ({ name, shortcuts: entries }));
}
