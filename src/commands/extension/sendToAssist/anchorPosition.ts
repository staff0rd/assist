import { GUTTER } from "./hostWidthStyle";

export function anchorPosition(
	anchor: HTMLElement,
	width: number,
): { top: number; left: number } {
	const rect = anchor.getBoundingClientRect();
	const left = Math.max(
		GUTTER,
		Math.min(rect.left, window.innerWidth - width - GUTTER),
	);
	return { top: rect.bottom + 4, left };
}
