import { alpha, type Theme } from "@mui/material/styles";

const wash = (t: Theme) => t.tokens.color.selected;

export const slashHighlightSx = {
	inline: {
		color: "primary.main",
		bgcolor: wash,
		borderRadius: 0.5,
		// A spread shadow widens the wash without shifting glyphs off the textarea's caret.
		boxShadow: (t: Theme) => `0 0 0 2px ${wash(t)}`,
	},
	chip: {
		fontFamily: "fontFamilyMono",
		fontSize: "0.93em",
		color: "primary.main",
		bgcolor: wash,
		border: 1,
		borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
		borderRadius: 0.5,
		px: 0.75,
		py: "1px",
	},
} as const;
