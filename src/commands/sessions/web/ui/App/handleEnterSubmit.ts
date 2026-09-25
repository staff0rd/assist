import type { KeyboardEvent } from "react";

export function handleEnterSubmit(e: KeyboardEvent<HTMLDivElement>) {
	const isPlainEnter =
		e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing;
	if (!isPlainEnter) {
		return;
	}
	e.preventDefault();
	e.currentTarget.closest("form")?.requestSubmit();
}
