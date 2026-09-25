import { useEffect } from "react";
import { isSaveKey } from "./useSaveHotkey/isSaveKey";

const beforeMonacoAndBrowser = true;

export function useSaveHotkey(save: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!isSaveKey(event)) return;
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
