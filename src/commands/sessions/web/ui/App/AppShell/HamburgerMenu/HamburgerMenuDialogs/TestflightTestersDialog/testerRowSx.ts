import { listRowHeight } from "../../../../../designSystem/listRowHeight";

export const testerRowSx = {
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	columnGap: 1.5,
	rowGap: 0.75,
	px: 3,
	py: 1,
	minHeight: listRowHeight,
	"&:hover": { bgcolor: "action.hover" },
} as const;

export const testerEmailSx = {
	flex: "1 1 160px",
	minWidth: 0,
	fontSize: 14,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;
