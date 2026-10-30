const SLOP = 10;

export type RowGesture = {
	x: number;
	y: number;
	base: number;
	swiping: boolean;
};

type RowGestureMove =
	| { kind: "scroll" }
	| { kind: "wait" }
	| { kind: "swipe"; offset: number; started: boolean };

export function rowGestureMove(
	g: RowGesture,
	x: number,
	y: number,
	revealWidth: number,
): RowGestureMove {
	const dx = x - g.x;
	const dy = y - g.y;
	if (!g.swiping && Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx))
		return { kind: "scroll" };
	if (!g.swiping && Math.abs(dx) <= SLOP) return { kind: "wait" };
	return {
		kind: "swipe",
		offset: Math.min(0, Math.max(-revealWidth, g.base + dx)),
		started: !g.swiping,
	};
}

export function snapOffset(offset: number, revealWidth: number): number {
	return offset < -revealWidth / 2 ? -revealWidth : 0;
}

export function startRowGesture(
	point: { clientX: number; clientY: number },
	base: number,
): RowGesture {
	return { x: point.clientX, y: point.clientY, base, swiping: false };
}
