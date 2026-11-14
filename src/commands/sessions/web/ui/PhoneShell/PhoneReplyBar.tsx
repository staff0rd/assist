import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../shared/harnesses";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { PhoneReplyField } from "./PhoneReplyField";
import { PhoneReplySend } from "./PhoneReplySend";
import { PhoneReplyStop } from "./PhoneReplyStop";
import { PhoneReplySuggestions } from "./PhoneReplySuggestions";
import { phoneReplyBarSx } from "./phoneReplyBarSx";
import { useShellReply } from "./useShellReply";

export type ReplyStop = { disabled: boolean; onStop: () => void };

export function PhoneReplyBar({
	harness,
	commands = [],
	onSend,
	onRunShell,
	stop,
	locked,
	suggestion,
	draftSessionId,
}: {
	harness?: HarnessKind;
	commands?: SlashCommand[];
	onSend: (text: string) => void;
	onRunShell?: (command: string) => void;
	stop?: ReplyStop;
	locked?: string;
	suggestion?: string;
	draftSessionId?: string;
}) {
	const { reply, shell, send } = useShellReply(commands, draftSessionId, {
		onSend,
		onRunShell,
		locked,
	});
	return (
		<>
			<PhoneReplySuggestions
				reply={reply}
				suggestion={shell.shell ? undefined : suggestion}
				locked={locked}
			/>
			<Box sx={phoneReplyBarSx.bar}>
				<PhoneReplyField
					reply={reply}
					harness={harness}
					locked={locked}
					shell={shell}
				/>
				{stop && <PhoneReplyStop {...stop} />}
				<PhoneReplySend
					disabled={Boolean(locked) || !reply.text.trim()}
					shell={shell.shell}
					onSend={send}
				/>
			</Box>
		</>
	);
}
