import type { KeyboardEvent } from "react";

type SlashKeyAction = "next" | "previous" | "insert" | "close";

export function slashKeyAction(e: KeyboardEvent): SlashKeyAction | null {
	if (e.nativeEvent.isComposing) return null;
	if (e.key === "ArrowDown") return "next";
	if (e.key === "ArrowUp") return "previous";
	if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) return "insert";
	if (e.key === "Escape") return "close";
	return null;
}
