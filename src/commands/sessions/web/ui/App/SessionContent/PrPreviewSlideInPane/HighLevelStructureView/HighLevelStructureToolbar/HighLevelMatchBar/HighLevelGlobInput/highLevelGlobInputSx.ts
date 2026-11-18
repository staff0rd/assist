import { sessionTextSize } from "../../../../../../sessionTextSize";
import type { Theme } from "@mui/material/styles";

export const highLevelGlobInputSx = {
	display: "flex",
	alignItems: "center",
	height: 28,
	flex: "1 1 180px",
	minWidth: 0,
	maxWidth: 320,
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	"&:focus-within": {
		borderColor: "primary.main",
		boxShadow: (theme: Theme) => `0 0 0 1px ${theme.palette.primary.main}`,
	},
} as const;

export const highLevelGlobLabelSx = {
	fontSize: sessionTextSize(11),
	color: "text.disabled",
	whiteSpace: "nowrap",
	px: 1,
} as const;
