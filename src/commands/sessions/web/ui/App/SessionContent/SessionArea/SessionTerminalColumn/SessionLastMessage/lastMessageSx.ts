const aboveTerminalOverlays = 20;

const baseSx = {
	position: "absolute",
	top: 0,
	left: 0,
	width: { xs: "60%", md: "33%" },
	px: 2,
	py: 1.25,
	bgcolor: "background.paper",
	color: "text.secondary",
	borderRight: 1,
	borderBottom: 1,
	borderColor: "divider",
	borderBottomRightRadius: 1,
	fontSize: "1rem",
	lineHeight: 1.4,
} as const;

const collapsedSx = {
	...baseSx,
	zIndex: aboveTerminalOverlays,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	userSelect: "none",
	cursor: "pointer",
} as const;

const expandedSx = {
	...collapsedSx,
	zIndex: aboveTerminalOverlays + 1,
	whiteSpace: "pre-wrap",
	overflowWrap: "anywhere",
	textOverflow: "clip",
	maxHeight: "50vh",
	boxShadow: 4,
} as const;

const pinnedSx = {
	...expandedSx,
	overflow: "hidden auto",
	userSelect: "text",
	cursor: "auto",
} as const;

export function lastMessageSx(pinned: boolean, expanded: boolean) {
	if (pinned) return pinnedSx;
	return expanded ? expandedSx : collapsedSx;
}
