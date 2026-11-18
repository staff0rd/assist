import Box from "@mui/material/Box";
import { SessionSlashProviders } from "../../slashSuggestions/SessionSlashProviders";
import type { SessionInfo } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionBody } from "../SessionContent/SessionArea/SessionBody";

export function CardSessionView({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	return (
		<ApiNodeContext.Provider value={session.node}>
			<SessionSlashProviders session={session}>
				<Box
					component="section"
					aria-label="Session"
					data-testid="card-session-view"
					sx={(t) => ({
						flex: 1,
						minWidth: 0,
						display: "flex",
						borderRight: 1,
						borderColor: t.tokens.color.line,
					})}
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
				</Box>
			</SessionSlashProviders>
		</ApiNodeContext.Provider>
	);
}
