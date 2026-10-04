const PRESENCE_MS = 5000;

let lastInteraction = 0;

function markInteraction(): void {
	lastInteraction = Date.now();
}

if (typeof document !== "undefined") {
	if (document.hasFocus()) markInteraction();
	globalThis.addEventListener("pointerdown", markInteraction, true);
	globalThis.addEventListener("keydown", markInteraction, true);
}

export function isUserPresent(): boolean {
	return document.hasFocus() && Date.now() - lastInteraction < PRESENCE_MS;
}
