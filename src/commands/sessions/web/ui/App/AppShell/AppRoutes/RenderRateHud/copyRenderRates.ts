const FLASH_MS = 600;

export function copyRenderRates(
	element: HTMLElement | null,
	text: string,
): void {
	if (!element || !text) return;
	void navigator.clipboard?.writeText(text);
	const previous = element.style.outline;
	element.style.outline = "2px solid #7cfc9a";
	setTimeout(() => {
		element.style.outline = previous;
	}, FLASH_MS);
}
