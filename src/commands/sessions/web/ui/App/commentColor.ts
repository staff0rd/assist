type CommentColor = { fill: string; solid: string };

const HUES = [
	"#ff6b6b",
	"#f06595",
	"#cc5de8",
	"#845ef7",
	"#5c7cfa",
	"#339af0",
	"#22b8cf",
	"#20c997",
	"#51cf66",
	"#94d82d",
	"#fcc419",
	"#ff922b",
];

function fillFrom(hex: string): string {
	const n = Number.parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.35)`;
}

export function commentColor(index: number): CommentColor {
	const solid = HUES[((index % HUES.length) + HUES.length) % HUES.length];
	return { solid, fill: fillFrom(solid) };
}
