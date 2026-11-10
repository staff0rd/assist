import { useMemo } from "react";
import { countRender } from "../../../../sessions/web/ui/renderCounters";
import { MarkdownHtml } from "./MarkdownHtml";
import { markdownSx, wideMarkdownSx } from "./markdownSx";
import { MarkdownSegments } from "./MarkdownSegments";
import { renderMarkdown } from "./renderMarkdown";
import { splitMarkdownSegments } from "./splitMarkdownSegments";

export function MarkdownBlock({
	content,
	renderMermaid = false,
	wide = false,
}: {
	content: string;
	renderMermaid?: boolean;
	wide?: boolean;
}) {
	countRender("MarkdownBlock");
	const segments = useMemo(
		() => (renderMermaid ? splitMarkdownSegments(content) : null),
		[content, renderMermaid],
	);
	const sx = wide ? wideMarkdownSx : markdownSx;

	if (!segments)
		return (
			<MarkdownHtml
				className="markdown"
				sx={sx}
				html={renderMarkdown(content)}
			/>
		);

	return <MarkdownSegments segments={segments} sx={sx} naturalWidth={wide} />;
}
