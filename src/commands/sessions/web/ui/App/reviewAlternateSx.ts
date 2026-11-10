import type { Theme } from "@mui/material/styles";

export const reviewAlternateSx = {
	row: { gap: 0.75 },
	rowWithAlternates: { gap: 0.75, pr: 0.5 },
	label: { flex: 1, minWidth: 0 },
	group: {
		display: "flex",
		gap: 0.25,
		opacity: 0.72,
		transition: "opacity .2s ease",
		".MuiMenuItem-root:hover &, .MuiMenuItem-root:focus-within &, .MuiMenuItem-root.Mui-focusVisible &":
			{ opacity: 1 },
	},
	button: (t: Theme) => ({
		px: 0.875,
		lineHeight: "20px",
		fontSize: 12,
		fontWeight: 500,
		color: "text.secondary",
		border: 1,
		borderColor: "transparent",
		borderRadius: `${t.tokens.radius.sm}px`,
		transition:
			"background-color .2s ease, color .2s ease, border-color .2s ease",
		"&:hover, &.Mui-focusVisible": {
			color: "primary.main",
			borderColor: "divider",
			bgcolor: "background.paper",
		},
	}),
} as const;
