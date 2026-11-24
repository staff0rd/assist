import type { KeyboardEvent } from "react";

export function isPlainArrowUp(e: KeyboardEvent): boolean {
	return (
		e.key === "ArrowUp" &&
		!e.shiftKey &&
		!e.ctrlKey &&
		!e.altKey &&
		!e.metaKey &&
		!e.nativeEvent.isComposing
	);
}
