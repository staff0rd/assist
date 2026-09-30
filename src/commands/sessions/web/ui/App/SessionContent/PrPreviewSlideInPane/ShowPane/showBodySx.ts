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
	"& .markdown pre code": { whiteSpace: "pre" },
});
