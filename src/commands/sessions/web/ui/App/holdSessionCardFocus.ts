let heldId: string | null = null;

export function holdSessionCardFocus(id: string): void {
	const card = globalThis.document.querySelector<HTMLElement>(
		`[data-session-id="${id}"]`,
	);
	if (!card) return;
	heldId = id;
	card.focus({ preventScroll: true });
}

export function isSessionCardFocusHeld(): boolean {
	if (heldId === null) return false;
	const focused = globalThis.document.activeElement;
	return focused?.getAttribute("data-session-id") === heldId;
}
