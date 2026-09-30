import type { Theme } from "@mui/material";
import { markdownContentSx } from "../../../../../../../backlog/web/ui/components/markdownSx";

export const showBodySx = (theme: Theme) => ({
	flex: 1,
	overflow: "auto",
	p: 2,
	"& .markdown": {
		...markdownContentSx(theme),
		maxWidth: "none",
		wordBreak: "normal",
		overflowWrap: "anywhere",
	},
	"& .markdown code": { whiteSpace: "nowrap" },
	"& .markdown pre": { position: "relative" },
	"& .markdown pre code": { whiteSpace: "pre" },
	"& .copy-code": {
		display: "inline-flex",
		verticalAlign: "middle",
		ml: 0.25,
		p: 0.25,
		border: 0,
		borderRadius: 1,
		background: "transparent",
		color: theme.palette.text.secondary,
		cursor: "pointer",
		"&:hover": { color: theme.palette.text.primary },
		"& svg": { width: 14, height: 14, fill: "currentColor" },
		"& .check-icon": { display: "none" },
		"&.copied .copy-icon": { display: "none" },
		"&.copied .check-icon": { display: "inline" },
	},
	"& .markdown pre .copy-code": {
		position: "absolute",
		top: theme.spacing(0.5),
		right: theme.spacing(0.5),
		background: theme.palette.background.paper,
	},
});
