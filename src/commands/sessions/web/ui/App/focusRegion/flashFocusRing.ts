const RING_MS = 1000;

export function flashFocusRing(element: HTMLElement, color: string): void {
	const ring = { outline: `2px solid ${color}`, outlineOffset: "-2px" };
	const reduceMotion = globalThis.matchMedia?.(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const end = reduceMotion ? ring : { ...ring, outlineColor: "transparent" };
	element.animate?.([ring, end], { duration: RING_MS, easing: "ease-in" });
}
