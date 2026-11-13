import Box from "@mui/material/Box";
import type { SendPrDecision } from "./SessionArea/SessionPreviewSplit";
import type { FetchSessionTranscript } from "./SessionArea/LiveTranscriptArea";
import { SessionAreaTopBar } from "./SessionArea/SessionAreaTopBar";
import { SessionDiffSplit } from "./SessionArea/SessionDiffSplit";
import { SessionTerminalColumn } from "./SessionArea/SessionTerminalColumn";
import type { TerminalAreaProps } from "./SessionArea/TerminalArea";
import { TranscriptArea } from "./SessionArea/TranscriptArea";
import type { SessionListHandlers, Transcript } from "../../types";
import { ApiNodeContext } from "../../useApiNode";

const areaSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

export function SessionArea({
	viewingTranscriptSessionId,
	transcript,
	sendPrDecision,
	lifecycle,
	fetchSessionTranscript,
	...terminal
}: TerminalAreaProps & {
	viewingTranscriptSessionId: string | null;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
	sendPrDecision: SendPrDecision;
	lifecycle: SessionListHandlers;
}) {
	if (viewingTranscriptSessionId !== null)
		return (
			<TranscriptArea
				sessionId={viewingTranscriptSessionId}
				transcript={transcript}
			/>
		);

	const activeSession = terminal.sessions.find(
		(s) => s.id === terminal.activeId,
	);

	return (
		<ApiNodeContext.Provider value={activeSession?.node}>
			<Box sx={areaSx}>
				<SessionAreaTopBar
					session={activeSession}
					sessions={terminal.sessions}
					lifecycle={lifecycle}
				/>
				<SessionDiffSplit
					sessionId={terminal.activeId}
					sessions={terminal.sessions}
					sendInput={terminal.sendInput}
				>
					<SessionTerminalColumn
						{...terminal}
						activeSession={activeSession}
						sendPrDecision={sendPrDecision}
						transcript={transcript}
						fetchSessionTranscript={fetchSessionTranscript}
					/>
				</SessionDiffSplit>
			</Box>
		</ApiNodeContext.Provider>
	);
}
