import type { KeyboardEvent } from "react";

export function handleEnterSubmit(
	e: KeyboardEvent<HTMLDivElement>,
	value: string,
) {
	const isPlainEnter =
		e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing;
	if (!isPlainEnter) {
		return;
	}
	e.preventDefault();
	if (value.trim() !== "") {
		e.currentTarget.closest("form")?.requestSubmit();
	}
}
