import Box from "@mui/material/Box";
import {
	type SendPrDecision,
	SessionPreviewSplit,
} from "./SessionPreviewSplit";
import { SessionLastMessage } from "./SessionTerminalColumn/SessionLastMessage";
import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";
import type { SessionInfo } from "../../../types";

const columnSx = {
	position: "relative",
	display: "flex",
	flex: 1,
	minWidth: 0,
	minHeight: 0,
} as const;

export function SessionTerminalColumn({
	activeSession,
	sendPrDecision,
	showLastMessage,
	...terminal
}: TerminalAreaProps & {
	activeSession: SessionInfo | undefined;
	sendPrDecision: SendPrDecision;
	showLastMessage: boolean;
}) {
	return (
		<Box sx={columnSx}>
			<SessionPreviewSplit
				session={activeSession}
				sendPrDecision={sendPrDecision}
				sendInput={terminal.sendInput}
			>
				<TerminalArea {...terminal} />
			</SessionPreviewSplit>
			{showLastMessage && activeSession !== undefined && (
				<SessionLastMessage message={activeSession.lastUserMessage} />
			)}
		</Box>
	);
}
