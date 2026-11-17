import type { Theme } from "@mui/material";

export const copyCodeButtonSx = (theme: Theme) => ({
	display: "inline-flex",
	verticalAlign: "middle",
	ml: 0.25,
	p: 0.25,
	border: 0,
	borderRadius: 1,
	background: "transparent",
	color: theme.palette.text.secondary,
	cursor: "pointer",
	"&:hover": { color: theme.palette.text.primary },
	"& svg": {
		width: theme.tokens.density.iconButton.smallIcon,
		height: theme.tokens.density.iconButton.smallIcon,
		fill: "currentColor",
	},
	"& .check-icon": { display: "none" },
	"&.copied .copy-icon": { display: "none" },
	"&.copied .check-icon": { display: "inline" },
});
