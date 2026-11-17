import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../../../../backlog/web/ui/components/MarkdownHtml";
import type { SlashCommand } from "../../../../../../../../slashCommands/readSlashCommands";
import { addCopyButtons } from "../../../../../copyCode/addCopyButtons";
import { copyCodeOnClick } from "../../../../../copyCode/copyCodeOnClick";
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
		() =>
			addCopyButtons(renderTranscriptMarkdown(text, commands && { commands })),
		[text, commands],
	);
	return (
		<MarkdownHtml
			className="markdown"
			sx={transcriptMarkdownSx}
			html={html}
			onClick={copyCodeOnClick}
		/>
	);
}
