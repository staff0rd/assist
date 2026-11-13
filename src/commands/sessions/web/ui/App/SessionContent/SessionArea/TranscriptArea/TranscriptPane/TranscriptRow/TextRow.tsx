import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useKnownSlashCommands } from "../../../../../../slashSuggestions/useKnownSlashCommands";
import { SlashCommandText } from "../../../../../../slashSuggestions/SlashCommandText";
import { slashHighlightSx } from "../../../../../../slashSuggestions/slashHighlightSx";
import { HighlightedText } from "./TextRow/HighlightedText";
import { TextRowLabel } from "./TextRow/TextRowLabel";

export function TextRow({
	role,
	text,
	term,
	queued,
}: {
	role: "user" | "assistant";
	text: string;
	term: string;
	queued?: boolean;
}) {
	const isUser = role === "user";
	const commands = useKnownSlashCommands();
	const accent = isUser ? "info.main" : "success.main";
	return (
		<Box
			sx={{
				mb: 1.5,
				pl: 1.5,
				py: 1,
				pr: 1,
				borderLeft: 2,
				borderLeftStyle: queued ? "dashed" : "solid",
				borderColor: accent,
				opacity: queued ? 0.65 : 1,
				borderTopRightRadius: 1,
				borderBottomRightRadius: 1,
				bgcolor: isUser ? "action.hover" : "transparent",
			}}
		>
			<TextRowLabel isUser={isUser} accent={accent} queued={queued} />
			<Typography
				variant="body2"
				sx={{
					color: "text.primary",
					whiteSpace: "pre-wrap",
					overflowWrap: "anywhere",
					lineHeight: 1.6,
				}}
			>
				<SlashCommandText
					text={text}
					commands={isUser ? commands : []}
					commandSx={slashHighlightSx.chip}
					renderText={(t) => <HighlightedText text={t} term={term} />}
				/>
			</Typography>
		</Box>
	);
}
