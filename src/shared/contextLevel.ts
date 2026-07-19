type ContextLevel = "red" | "yellow" | "dim";

export function contextLevel(pct: number): ContextLevel {
	if (pct >= 30) return "red";
	if (pct >= 20) return "yellow";
	return "dim";
}
