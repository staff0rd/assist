import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material";

const baseCardSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.5,
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
	id: { color: "text.disabled", flexShrink: 0 },
	name: { fontWeight: 500, flex: 1, textAlign: "left" },
	chip: {
		flexShrink: 0,
		fontWeight: 500,
		fontSize: "0.75rem",
		height: 22,
	},
};
