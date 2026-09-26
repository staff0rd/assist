import { useMemo } from "react";
import { SessionArea } from "./SessionContent/SessionArea";
import { LastMessageHistoryContext } from "./useLastMessageHistory";
import type { SessionSocket } from "../useSessionSocket";

export function SessionContent({ socket }: { socket: SessionSocket }) {
	const lifecycle = useMemo(
		() => ({
			onRetry: socket.retrySession,
			onRestart: socket.restartSession,
			onDismiss: socket.dismissSession,
			onSetAutoRun: socket.setAutoRun,
			onSetAutoAdvance: socket.setAutoAdvance,
		}),
		[
			socket.retrySession,
			socket.restartSession,
			socket.dismissSession,
			socket.setAutoRun,
			socket.setAutoAdvance,
		],
	);
	const lastMessageHistory = useMemo(
		() => ({
			userMessages: socket.userMessages,
			fetchUserMessages: socket.fetchUserMessages,
		}),
		[socket.userMessages, socket.fetchUserMessages],
	);
	return (
		<LastMessageHistoryContext.Provider value={lastMessageHistory}>
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
				sendPrDecision={socket.sendPrDecision}
			/>
		</LastMessageHistoryContext.Provider>
	);
}
