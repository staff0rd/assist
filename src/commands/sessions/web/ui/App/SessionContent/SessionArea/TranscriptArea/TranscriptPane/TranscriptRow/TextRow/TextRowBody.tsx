import Typography from "@mui/material/Typography";
import { sessionTypeSize } from "../../../../../../sessionTypeSize";
import { useKnownSlashCommands } from "../../../../../../../slashSuggestions/useKnownSlashCommands";
import { SlashCommandText } from "../../../../../../../slashSuggestions/SlashCommandText";
import { slashHighlightSx } from "../../../../../../../slashSuggestions/slashHighlightSx";
import { TranscriptMarkdown } from "./TranscriptMarkdown";
import { HighlightedText } from "./HighlightedText";

const plainSx = {
	color: "text.primary",
	whiteSpace: "pre-wrap",
	overflowWrap: "anywhere",
	lineHeight: 1.6,
	fontSize: sessionTypeSize("body2"),
} as const;

export function TextRowBody({
	isUser,
	text,
	term,
}: {
	isUser: boolean;
	text: string;
	term: string;
}) {
	const commands = useKnownSlashCommands();
	if (!term)
		return (
			<TranscriptMarkdown
				text={text}
				commands={isUser ? commands : undefined}
			/>
		);
	return (
		<Typography variant="body2" sx={plainSx}>
			<SlashCommandText
				text={text}
				commands={isUser ? commands : []}
				commandSx={slashHighlightSx.chip}
				renderText={(t) => <HighlightedText text={t} term={term} />}
			/>
		</Typography>
	);
}
