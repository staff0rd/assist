import type { Theme } from "@mui/material";
import { markdownContentSx } from "../../../backlog/web/ui/components/markdownSx";

export const previewBodySx = (theme: Theme) => ({
	flex: 1,
	overflow: "auto",
	p: 2,
	position: "relative",
	userSelect: "none",
	cursor: "text",
	lineHeight: 1.7,
	wordBreak: "break-word",
	"& .markdown": { ...markdownContentSx(theme), maxWidth: "none" },
	"& a": { color: "primary.main" },
	"& mark.pr-comment": {
		color: "inherit",
		borderRadius: "2px",
	},
});
