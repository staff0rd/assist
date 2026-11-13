import Box from "@mui/material/Box";
import type { FetchSessionTranscript } from "./LiveTranscriptArea";
import { SessionBody } from "./SessionBody";
import {
	type SendPrDecision,
	SessionPreviewSplit,
} from "./SessionPreviewSplit";
import { SessionLastMessage } from "./SessionTerminalColumn/SessionLastMessage";
import type { TerminalAreaProps } from "./TerminalArea";
import type { SessionInfo, Transcript } from "../../../types";
import { useLastMessageHistory } from "../useLastMessageHistory";

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
	...body
}: TerminalAreaProps & {
	activeSession: SessionInfo | undefined;
	sendPrDecision: SendPrDecision;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
}) {
	const { history, onFetchHistory } = useLastMessageHistory(activeSession?.id);

	return (
		<Box sx={columnSx}>
			<SessionPreviewSplit
				session={activeSession}
				sendPrDecision={sendPrDecision}
				sendInput={body.sendInput}
			>
				<SessionBody {...body} activeSession={activeSession} />
			</SessionPreviewSplit>
			{activeSession !== undefined && !activeSession.sdk && (
				<SessionLastMessage
					message={activeSession.lastUserMessage}
					history={history}
					onFetchHistory={onFetchHistory}
				/>
			)}
		</Box>
	);
}
