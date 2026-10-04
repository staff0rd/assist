let held: HTMLElement | null = null;

export function holdFocus(element: HTMLElement): void {
	held = element;
	element.focus({ preventScroll: true });
}

export function isFocusHeld(): boolean {
	return held !== null && globalThis.document.activeElement === held;
}
