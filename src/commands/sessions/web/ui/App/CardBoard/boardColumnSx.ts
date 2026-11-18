import type { BoardLayout } from "./boardLayout";

export function boardColumnSx(layout: BoardLayout) {
	return {
		flex: layout === "full" ? 1 : "5 1 0",
		minWidth: 0,
		overflow: "auto",
		px: 4,
		py: 3.5,
		display: "flex",
		flexDirection: "column",
		gap: 4,
		bgcolor: "background.default",
	} as const;
}
