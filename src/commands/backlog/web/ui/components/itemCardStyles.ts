import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material";

const baseCardSx = {
	display: "grid",
	gridTemplateColumns: "auto minmax(0, 1fr) auto",
	alignItems: "center",
	columnGap: 1.5,
	width: "100%",
	textAlign: "left",
	p: 2,
	mb: 1,
	borderRadius: 2,
	border: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	transition: "box-shadow 0.2s",
	"&:hover": { boxShadow: 3 },
} as const;

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
	name: {
		fontWeight: 500,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	meta: {
		display: "flex",
		alignItems: "center",
		gap: 1,
		minWidth: 0,
		fontSize: "0.75rem",
		color: "text.secondary",
		"& a, & p": { fontSize: "0.75rem" },
	},
	id: { color: "text.disabled" },
	actions: { display: "flex", alignItems: "center", gap: 1, flexShrink: 0 },
};
