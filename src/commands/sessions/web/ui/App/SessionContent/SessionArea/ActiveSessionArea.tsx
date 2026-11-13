import Box from "@mui/material/Box";
import type { SessionListHandlers, Transcript } from "../../../types";
import { ApiNodeContext } from "../../../useApiNode";
import type {
	FetchSessionTranscript,
	InterruptSession,
} from "./LiveTranscriptArea";
import { SessionAreaTopBar } from "./SessionAreaTopBar";
import { SessionDiffSplit } from "./SessionDiffSplit";
import type { SendPrDecision } from "./SessionPreviewSplit";
import { SessionTerminalColumn } from "./SessionTerminalColumn";
import type { TerminalAreaProps } from "./TerminalArea";

const areaSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

export type ActiveSessionAreaProps = TerminalAreaProps & {
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
	interruptSession: InterruptSession;
	sendPrDecision: SendPrDecision;
	lifecycle: SessionListHandlers;
};

export function ActiveSessionArea({
	lifecycle,
	...column
}: ActiveSessionAreaProps) {
	const activeSession = column.sessions.find((s) => s.id === column.activeId);
	return (
		<ApiNodeContext.Provider value={activeSession?.node}>
			<Box sx={areaSx}>
				<SessionAreaTopBar
					session={activeSession}
					sessions={column.sessions}
					lifecycle={lifecycle}
				/>
				<SessionDiffSplit
					sessionId={column.activeId}
					sessions={column.sessions}
					sendInput={column.sendInput}
				>
					<SessionTerminalColumn {...column} activeSession={activeSession} />
				</SessionDiffSplit>
			</Box>
		</ApiNodeContext.Provider>
	);
}
