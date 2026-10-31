import type { Theme } from "@mui/material/styles";

export const clientFailuresBadgeSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.5,
	px: 1,
	height: 22,
	borderRadius: 1,
	fontSize: "inherit",
	color: "error.main",
	"&:hover, &:focus-visible": {
		bgcolor: (t: Theme) => t.tokens.color.statusBar.hover,
	},
} as const;

export const clientFailuresPanelSx = {
	width: "min(720px, calc(100vw - 32px))",
	maxHeight: "min(420px, 70vh)",
	display: "flex",
	flexDirection: "column",
	fontFamily: "fontFamilyMono",
	fontSize: 12,
} as const;

export const clientFailuresHeaderSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	px: 1.5,
	py: 0.75,
	borderBottom: 1,
	borderColor: "divider",
} as const;

export const clientFailuresListSx = {
	overflow: "auto",
	display: "grid",
	gridTemplateColumns: "auto auto minmax(0, 2fr) auto minmax(0, 1.5fr) auto",
	columnGap: 1.5,
	rowGap: 0.5,
	px: 1.5,
	py: 1,
	alignItems: "baseline",
	"& > span": {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	"& > .muted": { color: "text.secondary" },
	"& > .outcome": { color: "error.main" },
	"& > .duration": { textAlign: "right", color: "text.secondary" },
} as const;
