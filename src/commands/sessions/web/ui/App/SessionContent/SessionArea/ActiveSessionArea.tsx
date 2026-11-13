import Box from "@mui/material/Box";
import { useMemo } from "react";
import { SlashCommandSourceContext } from "../../../slashSuggestions/useSessionSlashCommands";
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
	const harness = activeSession?.harness;
	const cwd = activeSession?.cwd;
	const node = activeSession?.node;
	const slashSource = useMemo(
		() => (cwd ? { harness, cwd, node } : null),
		[harness, cwd, node],
	);
	return (
		<ApiNodeContext.Provider value={node}>
			<SlashCommandSourceContext.Provider value={slashSource}>
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
			</SlashCommandSourceContext.Provider>
		</ApiNodeContext.Provider>
	);
}
