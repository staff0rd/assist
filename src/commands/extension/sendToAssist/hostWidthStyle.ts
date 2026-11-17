export const GUTTER = 16;

export const MIN_WIDTH = 320;

export function hostWidthStyle(): string[] {
	const max = Math.max(0, window.innerWidth - 2 * GUTTER);
	return [
		"width: max-content",
		`min-width: ${Math.min(MIN_WIDTH, max)}px`,
		`max-width: ${max}px`,
		"box-sizing: border-box",
	];
}
