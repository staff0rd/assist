export const MIN_TERMINAL_FONT_SIZE = 9;
const MAX_TERMINAL_FONT_SIZE = 24;
const XTERM_CELL_ROUNDING_SLACK = 0.97;

export function fitFontSize(
	width: number,
	cols: number,
	charWidthRatio: number,
	zoom: number,
): number {
	const fitted = (width / (cols * charWidthRatio)) * XTERM_CELL_ROUNDING_SLACK;
	const size = Math.floor(fitted * zoom * 4) / 4;
	return Math.min(
		MAX_TERMINAL_FONT_SIZE,
		Math.max(MIN_TERMINAL_FONT_SIZE, size),
	);
}
