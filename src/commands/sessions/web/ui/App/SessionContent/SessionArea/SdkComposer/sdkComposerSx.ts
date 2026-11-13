import type { Theme } from "@mui/material/styles";
import { raisedBgcolor } from "../../../../designSystem/raisedBgcolor";

const control = (t: Theme) => t.tokens.density.target;

const iconButton = {
	flex: "none",
	width: control,
	height: control,
	borderRadius: (t: Theme) => `${t.tokens.radius.md}px`,
} as const;

export const sdkComposerSx = {
	bar: {
		flex: "none",
		borderTop: 1,
		borderColor: "divider",
		bgcolor: "background.paper",
		px: 2,
		pt: 1.25,
		pb: 1.5,
	},
	inner: {
		maxWidth: 820,
		mx: "auto",
		display: "flex",
		flexDirection: "column",
		gap: 0.75,
	},
	row: { display: "flex", alignItems: "flex-end", gap: 1 },
	field: {
		flex: 1,
		minWidth: 0,
		minHeight: control,
		px: 1.5,
		py: 1,
		border: 1,
		borderColor: "divider",
		borderRadius: (t: Theme) => `${t.tokens.radius.md}px`,
		bgcolor: "background.default",
		"&.Mui-focused": { borderColor: "primary.main" },
		"&.Mui-disabled": { opacity: 0.55 },
	},
	send: {
		...iconButton,
		bgcolor: "primary.main",
		color: "primary.contrastText",
		"&:hover": { bgcolor: "primary.main" },
		"&.Mui-disabled": { bgcolor: raisedBgcolor, color: "text.disabled" },
	},
	stop: {
		...iconButton,
		border: 1,
		borderColor: "error.main",
		color: "error.main",
		"&:hover": { bgcolor: "error.main", color: "background.default" },
		"&.Mui-disabled": {
			borderColor: "error.main",
			color: "error.main",
			opacity: 0.5,
		},
	},
	hint: {
		display: "flex",
		flexWrap: "wrap",
		columnGap: 1.5,
		fontSize: 12,
		color: "text.disabled",
	},
	kbd: {
		fontFamily: "fontFamilyMono",
		fontSize: 11,
		color: "text.secondary",
		border: 1,
		borderColor: "divider",
		borderRadius: 0.5,
		px: 0.5,
	},
} as const;
