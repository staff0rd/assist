import { useEffect } from "react";
import { shortcutRegistry } from "../../../../../shortcutRegistry";

const beforeMonacoAndBrowser = true;

export function useSaveHotkey(save: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!shortcutRegistry.save.matches(event)) return;
			event.preventDefault();
			save();
		};
		globalThis.addEventListener("keydown", onKeyDown, beforeMonacoAndBrowser);
		return () =>
			globalThis.removeEventListener(
				"keydown",
				onKeyDown,
				beforeMonacoAndBrowser,
			);
	}, [save]);
}
