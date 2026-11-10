import { alpha, type Theme } from "@mui/material/styles";

export const gapSx = (theme: Theme) => ({
	"& .diff-gap td": {
		backgroundColor: alpha(theme.palette.primary.main, 0.08),
		borderBlock: `1px solid ${theme.palette.divider}`,
	},
	"& .diff-gap-gutter": { p: 0 },
	"& .diff-gap-buttons": { display: "flex", flexDirection: "column" },
	"& .diff-gap-button": {
		width: "100%",
		minWidth: 88,
		height: 26,
		color: "text.secondary",
		transition: "background-color 0.2s ease, color 0.2s ease",
		"& + .diff-gap-button": {
			borderTop: `1px solid ${theme.palette.divider}`,
		},
		"&:hover": {
			backgroundColor: alpha(theme.palette.primary.main, 0.2),
			color: "primary.main",
		},
		"&.Mui-disabled": { color: "text.disabled" },
	},
	"& .diff-gap-content": {
		px: 1.5,
		color: "text.secondary",
		fontSize: 13,
		verticalAlign: "middle",
		whiteSpace: "nowrap",
	},
});
