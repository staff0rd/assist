import type { KeyboardEvent } from "react";

export function acceptsSuggestion(e: KeyboardEvent): boolean {
	if (e.key === "Tab") return !e.shiftKey;
	return (
		e.key === "ArrowRight" &&
		!e.shiftKey &&
		!e.ctrlKey &&
		!e.altKey &&
		!e.metaKey
	);
}
