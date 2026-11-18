import Box from "@mui/material/Box";
import { SessionSlashProviders } from "../../slashSuggestions/SessionSlashProviders";
import type { SessionInfo } from "../../types";
import { ApiNodeContext } from "../../useApiNode";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionAreaTopBar } from "../SessionContent/SessionArea/SessionAreaTopBar";
import { ShowTopBarTitleContext } from "../SessionContent/SessionArea/SessionAreaTopBar/ActiveSessionTopBar/SessionTopBar/useShowTopBarTitle";
import { SessionBody } from "../SessionContent/SessionArea/SessionBody";
import { SessionDiffSplit } from "../SessionContent/SessionArea/SessionDiffSplit";
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
					<ShowTopBarTitleContext.Provider value={false}>
						<SessionAreaTopBar
							session={session}
							sessions={socket.sessions}
							lifecycle={lifecycle}
						/>
					</ShowTopBarTitleContext.Provider>
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
		</ApiNodeContext.Provider>
	);
}
