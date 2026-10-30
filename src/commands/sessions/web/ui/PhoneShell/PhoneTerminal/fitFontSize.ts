export const MIN_TERMINAL_FONT_SIZE = 12;
const MAX_TERMINAL_FONT_SIZE = 18;
const MIN_ZOOMED_FONT_SIZE = 4;
const MAX_ZOOMED_FONT_SIZE = 32;
const XTERM_CELL_ROUNDING_SLACK = 0.97;

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export function fitFontSize(
	width: number,
	cols: number,
	charWidthRatio: number,
	zoom: number,
): number {
	const fitted = (width / (cols * charWidthRatio)) * XTERM_CELL_ROUNDING_SLACK;
	const base = clamp(fitted, MIN_TERMINAL_FONT_SIZE, MAX_TERMINAL_FONT_SIZE);
	const size = Math.floor(base * zoom * 4) / 4;
	return clamp(size, MIN_ZOOMED_FONT_SIZE, MAX_ZOOMED_FONT_SIZE);
}
