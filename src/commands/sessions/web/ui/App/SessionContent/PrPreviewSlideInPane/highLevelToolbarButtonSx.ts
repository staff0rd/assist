import { sessionTextSize } from "../../sessionTextSize";

export const highLevelToolbarButtonSx = {
	minHeight: 28,
	py: 0,
	px: 1,
	fontSize: sessionTextSize(12),
	textTransform: "none",
	whiteSpace: "nowrap",
	"& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 16 },
} as const;
