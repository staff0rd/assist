import Box from "@mui/material/Box";
import type { SessionInfo, Transcript } from "../../../types";
import type { FetchSessionTranscript } from "./LiveTranscriptArea";
import { SdkTranscriptOverlay } from "./SdkTranscriptOverlay";
import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";

const bodySx = {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	flex: 1,
	minWidth: 0,
	minHeight: 0,
} as const;

export function SessionBody({
	activeSession,
	transcript,
	fetchSessionTranscript,
	...terminal
}: TerminalAreaProps & {
	activeSession: SessionInfo | undefined;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
}) {
	const sdkSession = activeSession?.sdk ? activeSession : undefined;
	// why: an SDK session has no terminal, so it gets no xterm pane at all
	const terminalSessions = terminal.sessions.filter((s) => !s.sdk);
	return (
		<Box sx={bodySx}>
			<TerminalArea
				{...terminal}
				sessions={terminalSessions}
				activeId={sdkSession ? null : terminal.activeId}
			/>
			{sdkSession && (
				<SdkTranscriptOverlay
					session={sdkSession}
					transcript={transcript}
					fetchSessionTranscript={fetchSessionTranscript}
				/>
			)}
		</Box>
	);
}
