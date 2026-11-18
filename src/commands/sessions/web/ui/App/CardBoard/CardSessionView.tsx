import Box from "@mui/material/Box";
import { SessionSlashProviders } from "../../slashSuggestions/SessionSlashProviders";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionBody } from "../SessionContent/SessionArea/SessionBody";
import { SessionDiffSplit } from "../SessionContent/SessionArea/SessionDiffSplit";
import { cardSessionViewSx } from "./cardSessionViewSx";

export function CardSessionView({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	return (
		<SessionSlashProviders session={session}>
			<Box
				component="section"
				aria-label="Session"
				data-testid="card-session-view"
				sx={cardSessionViewSx}
			>
				<SessionDiffSplit
					sessionId={session.id}
					sessions={socket.sessions}
					sendInput={socket.sendInput}
				>
					<SessionBody
						activeSession={session}
						sessions={[session]}
						activeId={session.id}
						initialized={socket.initialized}
						onOutput={socket.onOutput}
						sendInput={socket.sendInput}
						sendResize={socket.sendResize}
						transcript={socket.transcript}
						fetchSessionTranscript={socket.fetchSessionTranscript}
						interruptSession={socket.interruptSession}
					/>
				</SessionDiffSplit>
			</Box>
		</SessionSlashProviders>
	);
}
