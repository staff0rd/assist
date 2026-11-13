import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { PhoneReplySend } from "./PhoneReplySend";
import { PhoneReplyStop } from "./PhoneReplyStop";
import { PhoneSlashSuggestions } from "./PhoneSlashSuggestions/PhoneSlashSuggestions";
import { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

export type ReplyStop = { disabled: boolean; onStop: () => void };

export function PhoneReplyBar({
	harness,
	commands = [],
	onSend,
	stop,
}: {
	harness?: HarnessKind;
	commands?: SlashCommand[];
	onSend: (text: string) => void;
	stop?: ReplyStop;
}) {
	const reply = useSlashReply(commands);
	const { text, suggestions } = reply;
	const send = () => {
		if (!text.trim()) return;
		onSend(text);
		reply.clear();
	};

	return (
		<>
			{suggestions && (
				<PhoneSlashSuggestions
					matches={suggestions.matches}
					query={suggestions.query}
					onPick={reply.pick}
				/>
			)}
			<Box sx={phoneReplyBarSx.bar}>
				<InputBase
					multiline
					maxRows={5}
					value={text}
					inputRef={reply.inputRef}
					onChange={(e) => reply.edit(e.target)}
					onSelect={(e) => reply.trackCursor(e.target as HTMLTextAreaElement)}
					placeholder={`Reply to ${harnessLabel(harness)}…`}
					sx={phoneReplyBarSx.field}
					inputProps={{ "aria-label": "Reply" }}
				/>
				{stop && <PhoneReplyStop {...stop} />}
				<PhoneReplySend disabled={!text.trim()} onSend={send} />
			</Box>
		</>
	);
}
