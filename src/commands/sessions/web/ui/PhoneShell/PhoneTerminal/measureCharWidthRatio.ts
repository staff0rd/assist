const PROBE_SIZE = 100;
const FALLBACK_RATIO = 0.6;

export function measureCharWidthRatio(fontFamily: string): number {
	const ctx = document.createElement("canvas").getContext("2d");
	if (!ctx) return FALLBACK_RATIO;
	ctx.font = `${PROBE_SIZE}px ${fontFamily}`;
	const width = ctx.measureText("W").width;
	return width > 0 ? width / PROBE_SIZE : FALLBACK_RATIO;
}
