import { useEffect } from "react";

const beforeXtermAndBrowser = true;

export function useCaptureHotkey(
	matches: (event: KeyboardEvent) => boolean,
	onHotkey: () => void,
): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!matches(event)) return;
			event.preventDefault();
			onHotkey();
		};
		globalThis.addEventListener("keydown", onKeyDown, beforeXtermAndBrowser);
		return () =>
			globalThis.removeEventListener(
				"keydown",
				onKeyDown,
				beforeXtermAndBrowser,
			);
	}, [matches, onHotkey]);
}
