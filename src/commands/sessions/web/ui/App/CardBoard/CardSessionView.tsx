import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { SessionSlashProviders } from "../../slashSuggestions/SessionSlashProviders";
import type { SessionInfo } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionBody } from "../SessionContent/SessionArea/SessionBody";

const slideDown = keyframes`
	from { transform: translateY(-100%); }
	to { transform: translateY(0); }
`;

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
						flex: "0 0 50%",
						minHeight: 0,
						display: "flex",
						borderBottom: 1,
						borderColor: t.tokens.color.line,
						animation: `${slideDown} 220ms ease-out`,
						"@media (prefers-reduced-motion: reduce)": { animation: "none" },
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
