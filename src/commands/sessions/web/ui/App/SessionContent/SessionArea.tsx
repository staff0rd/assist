import Box from "@mui/material/Box";
import type { SendPrDecision } from "./SessionArea/SessionPreviewSplit";
import { SessionAreaTopBar } from "./SessionArea/SessionAreaTopBar";
import { SessionDiffSplit } from "./SessionArea/SessionDiffSplit";
import { SessionTerminalColumn } from "./SessionArea/SessionTerminalColumn";
import type { TerminalAreaProps } from "./SessionArea/TerminalArea";
import { TranscriptArea } from "./SessionArea/TranscriptArea";
import type { SessionListHandlers, Transcript } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import { useTopBarLayoutContext } from "../useTopBarLayoutContext";

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
	...terminal
}: TerminalAreaProps & {
	viewingTranscriptSessionId: string | null;
	transcript: Transcript | null;
	sendPrDecision: SendPrDecision;
	lifecycle: SessionListHandlers;
}) {
	const topBar = useTopBarLayoutContext();

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
					shown={topBar}
					session={activeSession}
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
						showLastMessage={topBar}
					/>
				</SessionDiffSplit>
			</Box>
		</ApiNodeContext.Provider>
	);
}
