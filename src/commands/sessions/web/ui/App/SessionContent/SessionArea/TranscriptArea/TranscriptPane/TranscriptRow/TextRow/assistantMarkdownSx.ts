import type { Theme } from "@mui/material";
import { markdownContentSx } from "../../../../../../../../../../backlog/web/ui/components/markdownSx";

export const assistantMarkdownSx = (theme: Theme) => ({
	...markdownContentSx(theme),
	fontSize: theme.typography.body2.fontSize ?? "inherit",
	maxWidth: "none",
	lineHeight: 1.6,
	color: "text.primary",
	overflowWrap: "anywhere",
});
