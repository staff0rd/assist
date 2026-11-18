import type { BoardLayout } from "./boardLayout";

const BASIS: Record<BoardLayout, string | number> = {
	full: 1,
	narrow: "5 1 0",
	compact: "0 0 300px",
};

export function boardColumnSx(layout: BoardLayout) {
	const full = layout !== "compact";
	return {
		flex: BASIS[layout],
		minWidth: 0,
		overflow: "auto",
		px: full ? 4 : 2,
		py: full ? 3.5 : 2.5,
		display: "flex",
		flexDirection: "column",
		gap: layout === "compact" ? 3 : 4,
		bgcolor: "background.default",
	} as const;
}
