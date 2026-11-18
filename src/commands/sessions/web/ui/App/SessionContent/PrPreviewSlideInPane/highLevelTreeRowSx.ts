import { sessionTextSize } from "../../sessionTextSize";
import { alpha, type Theme } from "@mui/material/styles";

export const HIGH_LEVEL_TREE_INDENT = 12;

export const highLevelTintedRowSx = (theme: Theme) => ({
	bgcolor: alpha(theme.palette.primary.main, 0.08),
	"&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
});

export const highLevelTreeRowButtonSx = {
	width: "100%",
	minHeight: 24,
} as const;

export const highLevelTreeRowSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	minWidth: 0,
	py: 0.15,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
} as const;

export const highLevelButtonResetSx = {
	border: 0,
	bgcolor: "transparent",
	cursor: "pointer",
	textAlign: "left",
	color: "inherit",
	font: "inherit",
} as const;

export const highLevelTreeNameSx = {
	fontFamily: "fontFamilyMono",
	fontSize: sessionTextSize(12),
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export const highLevelTreeCountSx = {
	fontFamily: "fontFamilyMono",
	fontSize: sessionTextSize(11),
	flexShrink: 0,
} as const;

export const HIGH_LEVEL_STATUS_COLOURS = {
	added: "success.main",
	removed: "error.main",
	modified: "warning.main",
} as const;

export const HIGH_LEVEL_STATUS_LETTERS = {
	added: "A",
	removed: "D",
	modified: "M",
} as const;

export const highLevelMatchedRowSx = (theme: Theme) => ({
	position: "relative" as const,
	"&::before": {
		content: '""',
		position: "absolute",
		left: 0,
		top: 4,
		bottom: 4,
		width: 3,
		borderRadius: 1,
		bgcolor: theme.palette.warning.main,
	},
});
