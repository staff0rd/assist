import { holdFocus } from "../../../holdFocus";
import type { ShortcutName } from "../../../shortcutRegistry";
import type { Region } from "../../../focusRegion";

export function topBarActionRegion(shortcut: ShortcutName, id: string): Region {
	return {
		locate: () =>
			globalThis.document.querySelector<HTMLElement>(
				`[data-top-bar-session-id="${id}"] [data-shortcut="${shortcut}"]`,
			),
		focus: holdFocus,
	};
}
