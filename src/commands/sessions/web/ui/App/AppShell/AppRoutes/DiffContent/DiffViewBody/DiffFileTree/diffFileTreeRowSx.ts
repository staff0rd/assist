export const DIFF_TREE_INDENT = 10;
export const DIFF_TREE_CHEVRON_WIDTH = 20;

export const diffFileTreeRowSx = {
	display: "flex",
	justifyContent: "flex-start",
	alignItems: "center",
	gap: 0.5,
	width: "100%",
	minWidth: 0,
	py: 0.25,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
} as const;

const revealRevertSx = {
	"&:hover .diff-tree-revert, &:focus-within .diff-tree-revert": {
		opacity: 1,
	},
} as const;

export const diffFileTreeFileRowSx = {
	display: "flex",
	alignItems: "center",
	minWidth: 0,
	pr: 0.5,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
	...revealRevertSx,
} as const;

export const diffFileTreeHeaderSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	minWidth: 0,
	py: 0.25,
	pr: 0.5,
	...revealRevertSx,
} as const;

export const diffFileTreeRevertSx = {
	opacity: 0,
	flexShrink: 0,
	display: "flex",
	alignItems: "center",
} as const;

export const diffFileTreeActiveRowSx = {
	bgcolor: "action.selected",
	fontWeight: 600,
} as const;

export const diffFileTreeNameSx = {
	fontFamily: "monospace",
	fontSize: 12,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;
