export function swipeActivation(
	dx: number,
	dy: number,
	activation: number,
): "wait" | "reject" | "start" {
	if (Math.abs(dx) < activation && Math.abs(dy) < activation) return "wait";
	if (dx < activation || Math.abs(dy) > Math.abs(dx)) return "reject";
	return "start";
}
