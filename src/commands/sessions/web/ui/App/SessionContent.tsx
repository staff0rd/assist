import { useMemo } from "react";
import { SessionArea } from "./SessionContent/SessionArea";
import { LastMessageHistoryContext } from "./SessionContent/useLastMessageHistory";
import type { SessionSocket } from "../useSessionSocket";
import { useSessionLifecycle } from "./useSessionLifecycle";
import { SocketShellProviders } from "./SessionContent/SessionArea/TranscriptArea/SocketShellProviders";

export function SessionContent({ socket }: { socket: SessionSocket }) {
	const lifecycle = useSessionLifecycle(socket);
	const lastMessageHistory = useMemo(
		() => ({
			userMessages: socket.userMessages,
			fetchUserMessages: socket.fetchUserMessages,
		}),
		[socket.userMessages, socket.fetchUserMessages],
	);
	return (
		<LastMessageHistoryContext.Provider value={lastMessageHistory}>
			<SocketShellProviders socket={socket}>
				<SessionArea
					lifecycle={lifecycle}
					sessions={socket.sessions}
					activeId={socket.activeId}
					initialized={socket.initialized}
					onOutput={socket.onOutput}
					sendInput={socket.sendInput}
					sendResize={socket.sendResize}
					viewingTranscriptSessionId={socket.viewingTranscriptSessionId}
					transcript={socket.transcript}
					liveTranscripts={socket.liveTranscripts}
					fetchSessionTranscript={socket.fetchSessionTranscript}
					interruptSession={socket.interruptSession}
					sendPrDecision={socket.sendPrDecision}
				/>
			</SocketShellProviders>
		</LastMessageHistoryContext.Provider>
	);
}
