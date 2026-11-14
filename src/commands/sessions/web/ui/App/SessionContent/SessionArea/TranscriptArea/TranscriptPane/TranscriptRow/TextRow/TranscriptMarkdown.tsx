import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../../../../backlog/web/ui/components/MarkdownHtml";
import type { SlashCommand } from "../../../../../../../../slashCommands/readSlashCommands";
import { transcriptMarkdownSx } from "./transcriptMarkdownSx";
import { renderTranscriptMarkdown } from "./renderTranscriptMarkdown";

export function TranscriptMarkdown({
	text,
	commands,
}: {
	text: string;
	commands?: SlashCommand[];
}) {
	const html = useMemo(
		() => renderTranscriptMarkdown(text, commands && { commands }),
		[text, commands],
	);
	return (
		<MarkdownHtml className="markdown" sx={transcriptMarkdownSx} html={html} />
	);
}
