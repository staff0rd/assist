export type CellOrigin = { top: number; left: number };

export function cellOrigin(
	wrapper: HTMLElement,
	key: string,
): CellOrigin | null {
	const cell = wrapper.querySelector<HTMLElement>(
		`td.diff-code[data-change-key="${key}"]`,
	);
	if (!cell) return null;
	const base = wrapper.getBoundingClientRect();
	const rect = cell.getBoundingClientRect();
	return {
		top: rect.top - base.top + wrapper.scrollTop,
		left: rect.left - base.left + wrapper.scrollLeft,
	};
}
