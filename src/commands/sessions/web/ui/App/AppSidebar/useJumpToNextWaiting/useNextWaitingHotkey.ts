import { useEffect } from "react";
import { shortcutRegistry } from "../../shortcutRegistry";

const beforeXtermAndBrowser = true;

export function useNextWaitingHotkey(onJump: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!shortcutRegistry.nextWaiting.matches(event)) return;
			event.preventDefault();
			onJump();
		};
		globalThis.addEventListener("keydown", onKeyDown, beforeXtermAndBrowser);
		return () =>
			globalThis.removeEventListener(
				"keydown",
				onKeyDown,
				beforeXtermAndBrowser,
			);
	}, [onJump]);
}
