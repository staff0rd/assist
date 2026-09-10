import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material";

const baseCardSx = {
	position: "relative",
	display: "grid",
	gridTemplateColumns: "auto minmax(0, 1fr) auto",
	alignItems: "center",
	columnGap: 1.5,
	width: "100%",
	p: 2,
	mb: 1,
	borderRadius: 2,
	border: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	transition: "box-shadow 0.2s",
	"&:hover": { boxShadow: 3 },
} as const;

const stretchOverRowSx = {
	"&::after": {
		content: '""',
		position: "absolute",
		inset: 0,
		borderRadius: 2,
		zIndex: 1,
	},
	"&:focus-visible": { outline: "none" },
	"&:focus-visible::after": {
		outline: "2px solid",
		outlineColor: "primary.main",
		outlineOffset: "2px",
	},
} as const;

const aboveStretchedLinkSx = { position: "relative", zIndex: 2 } as const;

export const itemCardStyles: Record<string, SxProps<Theme>> = {
	card: baseCardSx,
	inProgressCard: {
		...baseCardSx,
		borderColor: "warning.main",
		borderLeft: 4,
		borderLeftColor: "warning.main",
		bgcolor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08),
	},
	main: { minWidth: 0, textAlign: "left" },
	stretchedNameLink: {
		display: "block",
		fontWeight: 500,
		color: "text.primary",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		...stretchOverRowSx,
	},
	meta: {
		display: "flex",
		alignItems: "center",
		gap: 1,
		...aboveStretchedLinkSx,
		width: "fit-content",
		maxWidth: "100%",
		fontSize: "0.75rem",
		color: "text.secondary",
		"& a, & p": { fontSize: "0.75rem" },
	},
	id: { color: "text.disabled" },
	actions: {
		display: "flex",
		alignItems: "center",
		gap: 1,
		flexShrink: 0,
		...aboveStretchedLinkSx,
	},
};
