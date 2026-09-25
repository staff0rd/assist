import { useEffect } from "react";
import { isNextWaitingKey } from "./useNextWaitingHotkey/isNextWaitingKey";

const beforeXtermAndBrowser = true;

export function useNextWaitingHotkey(onJump: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!isNextWaitingKey(event)) return;
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
