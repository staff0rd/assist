import type { Theme } from "@mui/material/styles";
import { listRowHeight } from "../designSystem/listRowHeight";

export const slashSuggestionListSx = {
	list: {
		position: "absolute",
		bottom: "100%",
		left: 0,
		right: 0,
		zIndex: 1,
		m: 0,
		mb: 0.75,
		p: 0.5,
		listStyle: "none",
		maxHeight: (t: Theme) => t.tokens.density.suggestionListMaxHeight,
		overflowY: "auto",
		bgcolor: "background.paper",
		border: 1,
		borderColor: "divider",
		borderRadius: (t: Theme) => `${t.tokens.radius.md}px`,
		boxShadow: (t: Theme) => t.tokens.elevation.overlay,
	},
	floating: { position: "static", mt: 0.5, mb: 0 },
	row: {
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "center",
		width: "100%",
		minHeight: listRowHeight,
		px: 1.25,
		py: 0.5,
		textAlign: "left",
		borderRadius: (t: Theme) => `${t.tokens.radius.sm}px`,
		"&:hover": { bgcolor: (t: Theme) => t.tokens.color.raised },
	},
	highlighted: {
		bgcolor: (t: Theme) => t.tokens.color.selected,
		"&:hover": { bgcolor: (t: Theme) => t.tokens.color.selected },
	},
} as const;
