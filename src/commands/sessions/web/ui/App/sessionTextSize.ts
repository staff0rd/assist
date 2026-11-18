const offsetVar = "var(--session-text-offset, 0px)";

export function sessionTextSize(base: string | number): string {
	const size = typeof base === "number" ? `${base}px` : base;
	if (size.includes(offsetVar)) return size;
	return `calc(${size} + ${offsetVar})`;
}
