import { alpha, type Theme } from "@mui/material/styles";

export const descriptionMarksSx = (theme: Theme) => ({
	"& .section-mark": {
		ml: 1,
		fontFamily: theme.typography.fontFamilyMono,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: 500,
		color: theme.palette.success.main,
	},
	"& .section-mark.optional": { color: theme.palette.text.disabled },
	"& .section-mark.missing": { color: theme.palette.error.main },
	"& .issue-ref": {
		fontFamily: theme.typography.fontFamilyMono,
		px: 0.75,
		borderRadius: 0.5,
		bgcolor: theme.tokens.color.wash.accent,
		outline: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
	},
});
