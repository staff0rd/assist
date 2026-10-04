import { useEffect } from "react";
import { resolveShortcut } from "../../../resolveShortcut";
import { type ShortcutName, shortcutRegistry } from "../../../shortcutRegistry";
import { useHotkeyBindings } from "../../../useHotkeyBindings";

const capture = true;
const KEEPS_MENU_OPEN = new Set<ShortcutName>(["openMenu", "cycleCards"]);
const closingShortcuts = (
	Object.keys(shortcutRegistry) as ShortcutName[]
).filter((name) => !KEEPS_MENU_OPEN.has(name));

export function useCloseOnShortcut(open: boolean, close: () => void): void {
	const bindings = useHotkeyBindings();

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				closingShortcuts.some((name) =>
					resolveShortcut(name, bindings).matches(event),
				)
			)
				close();
		};
		globalThis.addEventListener("keydown", onKeyDown, capture);
		return () => globalThis.removeEventListener("keydown", onKeyDown, capture);
	}, [open, close, bindings]);
}
