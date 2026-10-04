import { holdFocus } from "../holdFocus";

export function holdSessionCardFocus(id: string): void {
	const card = globalThis.document.querySelector<HTMLElement>(
		`[data-session-id="${id}"]`,
	);
	if (card) holdFocus(card);
}
