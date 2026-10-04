import { flashFocusRing } from "./focusRegion/flashFocusRing";

const MAX_FRAMES = 10;

export type Region = {
	locate: () => HTMLElement | null;
	focus: (region: HTMLElement) => void;
};

export function focusRegion(
	region: Region,
	ringColor: string,
	framesLeft = MAX_FRAMES,
): void {
	const element = region.locate();
	if (element) {
		region.focus(element);
		if (element.contains(globalThis.document.activeElement)) {
			flashFocusRing(element, ringColor);
			return;
		}
	}
	if (framesLeft > 0)
		globalThis.requestAnimationFrame(() =>
			focusRegion(region, ringColor, framesLeft - 1),
		);
}
