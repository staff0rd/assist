import type { BoardLayout } from "./boardLayout";

const BASIS: Record<BoardLayout, string | number> = {
	full: 1,
	narrow: "0 0 380px",
	compact: "0 0 300px",
};

export function boardColumnSx(layout: BoardLayout) {
	const full = layout === "full";
	return {
		flex: BASIS[layout],
		minWidth: 0,
		overflow: "auto",
		px: full ? 4 : layout === "narrow" ? 2.5 : 2,
		py: full ? 3.5 : 2.5,
		display: "flex",
		flexDirection: "column",
		gap: layout === "compact" ? 3 : 4,
		bgcolor: "background.default",
	} as const;
}
