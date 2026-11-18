import Box from "@mui/material/Box";
import { SessionSlashProviders } from "../../slashSuggestions/SessionSlashProviders";
import type { SessionInfo } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionAreaTopBar } from "../SessionContent/SessionArea/SessionAreaTopBar";
import { SessionBody } from "../SessionContent/SessionArea/SessionBody";
import { useSessionLifecycle } from "../useSessionLifecycle";
import { cardSessionViewSx } from "./cardSessionViewSx";

export function CardSessionView({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	const lifecycle = useSessionLifecycle(socket);
	return (
		<ApiNodeContext.Provider value={session.node}>
			<SessionSlashProviders session={session}>
				<Box
					component="section"
					aria-label="Session"
					data-testid="card-session-view"
					sx={cardSessionViewSx}
				>
					<SessionAreaTopBar
						session={session}
						sessions={socket.sessions}
						lifecycle={lifecycle}
					/>
					<Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
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
				</Box>
			</SessionSlashProviders>
		</ApiNodeContext.Provider>
	);
}
