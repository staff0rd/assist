import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../shared/harnesses";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { PhoneReplyField } from "./PhoneReplyField";
import { PhoneReplySend } from "./PhoneReplySend";
import { PhoneReplyStop } from "./PhoneReplyStop";
import { PhoneSuggestionChip } from "./PhoneSuggestionChip";
import { PhoneSlashSuggestions } from "./PhoneSlashSuggestions/PhoneSlashSuggestions";
import { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

export type ReplyStop = { disabled: boolean; onStop: () => void };

export function PhoneReplyBar({
	harness,
	commands = [],
	onSend,
	stop,
	locked,
	suggestion,
}: {
	harness?: HarnessKind;
	commands?: SlashCommand[];
	onSend: (text: string) => void;
	stop?: ReplyStop;
	locked?: string;
	suggestion?: string;
}) {
	const reply = useSlashReply(commands);
	const { text, suggestions } = reply;
	const send = () => {
		if (!text.trim() || locked) return;
		onSend(text);
		reply.clear();
	};

	return (
		<>
			{suggestion && !text && !locked && (
				<PhoneSuggestionChip
					suggestion={suggestion}
					onPick={() => reply.fill(suggestion)}
				/>
			)}
			{suggestions && (
				<PhoneSlashSuggestions
					matches={suggestions.matches}
					query={suggestions.query}
					onPick={reply.pick}
				/>
			)}
			<Box sx={phoneReplyBarSx.bar}>
				<PhoneReplyField reply={reply} harness={harness} locked={locked} />
				{stop && <PhoneReplyStop {...stop} />}
				<PhoneReplySend
					disabled={Boolean(locked) || !text.trim()}
					onSend={send}
				/>
			</Box>
		</>
	);
}
