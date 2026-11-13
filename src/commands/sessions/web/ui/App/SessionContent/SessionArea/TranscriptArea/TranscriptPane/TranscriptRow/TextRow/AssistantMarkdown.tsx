import type { Theme } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { markdownContentSx } from "../../../../../../../../../../backlog/web/ui/components/markdownSx";
import { renderTranscriptMarkdown } from "./renderTranscriptMarkdown";

const assistantMarkdownSx = (theme: Theme) => ({
	...markdownContentSx(theme),
	fontSize: theme.typography.body2.fontSize ?? "inherit",
	maxWidth: "none",
	lineHeight: 1.6,
	color: "text.primary",
	overflowWrap: "anywhere",
});

export function AssistantMarkdown({ text }: { text: string }) {
	const html = useMemo(() => renderTranscriptMarkdown(text), [text]);
	return (
		<MarkdownHtml className="markdown" sx={assistantMarkdownSx} html={html} />
	);
}
