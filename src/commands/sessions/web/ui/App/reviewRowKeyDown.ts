import type { KeyboardEvent } from "react";

export function reviewRowKeyDown(e: KeyboardEvent<HTMLElement>) {
	const row = e.currentTarget;
	const buttons = [...row.querySelectorAll<HTMLElement>("button")];
	const at = buttons.indexOf(e.target as HTMLElement);
	const next =
		e.key === "ArrowRight"
			? buttons[at + 1]
			: e.key === "ArrowLeft" && at !== -1
				? (buttons[at - 1] ?? row)
				: undefined;
	if (next) {
		e.preventDefault();
		e.stopPropagation();
		next.focus();
		return;
	}
	// Hand focus back to the row so MenuList moves Up/Down from it.
	if (at !== -1 && (e.key === "ArrowUp" || e.key === "ArrowDown")) row.focus();
}
