import type { KeyboardEvent } from "react";
import { handleEnterSubmit } from "../../../../../handleEnterSubmit";
import { type NewSessionMode, newSessionModeOrder } from "../newSessionModes";

const STEP: Record<string, number> = {
	ArrowRight: 1,
	ArrowDown: 1,
	ArrowLeft: -1,
	ArrowUp: -1,
};

export function modeRadioKeyHandler(
	value: NewSessionMode,
	onChange: (mode: NewSessionMode) => void,
) {
	return (e: KeyboardEvent<HTMLDivElement>) => {
		const step = e.key === "Tab" ? (e.shiftKey ? -1 : 1) : STEP[e.key];
		if (!step) {
			handleEnterSubmit(e);
			return;
		}
		e.preventDefault();
		const count = newSessionModeOrder.length;
		const index = newSessionModeOrder.indexOf(value);
		const next = newSessionModeOrder[(index + step + count) % count];
		onChange(next);
		e.currentTarget
			.querySelector<HTMLElement>(`[data-mode="${next}"]`)
			?.focus();
	};
}
