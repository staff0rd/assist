import type { Theme } from "@mui/material/styles";
import { listRowHeight } from "../../designSystem/listRowHeight";

export const phoneSlashSuggestionsSx = {
	list: {
		order: -1,
		flex: "none",
		maxHeight: (t: Theme) => t.tokens.density.listRow * 4.5,
		overflowY: "auto",
		bgcolor: "background.paper",
		borderTop: 1,
		borderColor: "divider",
	},
	row: {
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "center",
		width: "100%",
		minHeight: listRowHeight,
		px: 1.75,
		py: 0.75,
		textAlign: "left",
		borderBottom: 1,
		borderColor: "divider",
		"&:last-of-type": { borderBottom: 0 },
		"&:active": { bgcolor: (t: Theme) => t.tokens.color.selected },
	},
	first: { bgcolor: (t: Theme) => t.tokens.color.wash.accent },
} as const;
