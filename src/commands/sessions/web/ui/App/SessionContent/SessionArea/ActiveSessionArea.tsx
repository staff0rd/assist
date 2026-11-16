import Box from "@mui/material/Box";
import { SessionSlashProviders } from "../../../slashSuggestions/SessionSlashProviders";
import type { SessionListHandlers, Transcript } from "../../../types";
import { TransferBanner } from "../../../transfer/TransferBanner";
import { ApiNodeContext } from "../../../useApiNode";
import type {
	FetchSessionTranscript,
	InterruptSession,
} from "./LiveTranscriptArea";
import { SessionAreaTopBar } from "./SessionAreaTopBar";
import { SessionDiffSplit } from "./SessionDiffSplit";
import type { SendPrDecision } from "./SessionPreviewSplit";
import { SessionTerminalColumn } from "./SessionTerminalColumn";
import { TransferPanel } from "./TransferPanel";
import { transferStatus } from "../../../transfer/transferStatus";
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
	const node = activeSession?.node;
	const transferring =
		activeSession !== undefined && transferStatus(activeSession).pending;
	return (
		<ApiNodeContext.Provider value={node}>
			<SessionSlashProviders session={activeSession}>
				<Box sx={areaSx}>
					<SessionAreaTopBar
						session={activeSession}
						sessions={column.sessions}
						lifecycle={lifecycle}
					/>
					{activeSession && <TransferBanner session={activeSession} />}
					{transferring ? (
						<TransferPanel session={activeSession} />
					) : (
						<SessionDiffSplit
							sessionId={column.activeId}
							sessions={column.sessions}
							sendInput={column.sendInput}
						>
							<SessionTerminalColumn
								{...column}
								activeSession={activeSession}
							/>
						</SessionDiffSplit>
					)}
				</Box>
			</SessionSlashProviders>
		</ApiNodeContext.Provider>
	);
}
