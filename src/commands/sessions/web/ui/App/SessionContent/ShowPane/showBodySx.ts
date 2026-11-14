import type { Theme } from "@mui/material";
import { markdownContentSx } from "../../../../../../backlog/web/ui/components/markdownSx";
import { slateDocSx } from "../../../designSystem/slateDocSx";
import { copyCodeButtonSx } from "./copyCodeButtonSx";

export const showBodySx = (theme: Theme) => ({
	flex: 1,
	overflow: "auto",
	p: 2,
	...slateDocSx(theme),
	"& .markdown": {
		...markdownContentSx(theme),
		maxWidth: "none",
		wordBreak: "normal",
		overflowWrap: "anywhere",
	},
	"& .markdown code": { whiteSpace: "nowrap" },
	"& .markdown pre": { position: "relative" },
	"& .markdown pre code": { whiteSpace: "pre" },
	"& .copy-code": copyCodeButtonSx(theme),
	"& .markdown pre .copy-code": {
		position: "absolute",
		top: theme.spacing(0.5),
		right: theme.spacing(0.5),
		background: theme.palette.background.paper,
	},
});
