import { useCallback } from "react";
import { Navigate, Route, Routes } from "react-router";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneHistoryList } from "./PhoneHistoryList";
import { PhoneSessionList } from "./PhoneSessionList";
import { PhoneSessionScreen } from "./PhoneSessionScreen";
import { PhoneTranscriptScreen } from "./PhoneTranscriptScreen";

export function PhoneRoutes({
	socket,
	keyboardOpen,
	onOpenNodes,
	onNewSession,
}: {
	socket: SessionSocket;
	keyboardOpen: boolean;
	onOpenNodes: () => void;
	onNewSession: () => void;
}) {
	const localNode = socket.nodes?.local;
	const { wsRef, requestHistory } = socket;
	const refresh = useCallback(() => {
		wsRef.current?.close();
		requestHistory();
	}, [wsRef, requestHistory]);

	return (
		<Routes>
			<Route
				index
				element={
					<PhoneSessionList
						sessions={socket.sessions}
						localNode={localNode}
						reconnecting={socket.reconnecting}
						onRefresh={refresh}
						onOpenNodes={onOpenNodes}
						onNewSession={onNewSession}
					/>
				}
			/>
			<Route
				path="session/:id"
				element={
					<PhoneSessionScreen socket={socket} keyboardOpen={keyboardOpen} />
				}
			/>
			<Route
				path="history"
				element={
					<PhoneHistoryList
						history={socket.history}
						localNode={localNode}
						requestHistory={requestHistory}
					/>
				}
			/>
			<Route
				path="history/:id"
				element={<PhoneTranscriptScreen socket={socket} />}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
