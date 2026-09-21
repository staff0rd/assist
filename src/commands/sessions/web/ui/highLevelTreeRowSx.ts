export const HIGH_LEVEL_TREE_INDENT = 12;

export const highLevelTreeRowSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	minWidth: 0,
	py: 0.15,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
} as const;

export const highLevelTreeNameSx = {
	fontFamily: "monospace",
	fontSize: 12,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export const highLevelTreeCountSx = {
	fontFamily: "monospace",
	fontSize: 11,
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
