import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { assistantMarkdownSx } from "./assistantMarkdownSx";
import { renderTranscriptMarkdown } from "./renderTranscriptMarkdown";

export function AssistantMarkdown({ text }: { text: string }) {
	const html = useMemo(() => renderTranscriptMarkdown(text), [text]);
	return (
		<MarkdownHtml className="markdown" sx={assistantMarkdownSx} html={html} />
	);
}
