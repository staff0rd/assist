import { MIN_TERMINAL_FONT_SIZE } from "./fitFontSize";

const CELL_HEIGHT_RATIO = 1.25;
const MIN_COLS = 20;
const MIN_ROWS = 5;

export function phoneGridSize(
	width: number,
	height: number,
	charWidthRatio: number,
): { cols: number; rows: number } {
	const cellWidth = MIN_TERMINAL_FONT_SIZE * charWidthRatio;
	const cellHeight = MIN_TERMINAL_FONT_SIZE * CELL_HEIGHT_RATIO;
	return {
		cols: Math.max(MIN_COLS, Math.floor(width / cellWidth)),
		rows: Math.max(MIN_ROWS, Math.floor(height / cellHeight)),
	};
}
