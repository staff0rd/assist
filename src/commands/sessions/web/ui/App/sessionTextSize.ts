export function sessionTextSize(base: string | number): string {
	const size = typeof base === "number" ? `${base}px` : base;
	return `calc(${size} + var(--session-text-offset, 0px))`;
}
