export const clampSx = (lines: number) =>
	({
		display: "-webkit-box",
		WebkitLineClamp: lines,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	}) as const;
