import { Navigate, Route, Routes } from "react-router";
import type { SessionSocket } from "../useSessionSocket";
import { phoneBacklogRoutes } from "./PhoneBacklog/phoneBacklogRoutes";
import { PhoneHistoryList } from "./PhoneHistoryList";
import { PhoneSessionList } from "./PhoneSessionList";
import { PhoneSessionScreen } from "./PhoneSessionScreen";
import { PhoneTranscriptScreen } from "./PhoneTranscriptScreen";
import { usePhoneRefresh } from "./usePhoneRefresh";

export function PhoneRoutes({
	socket,
	keyboardOpen,
	onOpenNodes,
	onOpenHomeUpdate,
	onNewSession,
}: {
	socket: SessionSocket;
	keyboardOpen: boolean;
	onOpenNodes: () => void;
	onOpenHomeUpdate: () => void;
	onNewSession: () => void;
}) {
	const localNode = socket.nodes?.local;
	const refresh = usePhoneRefresh(socket);

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
						onOpenHomeUpdate={onOpenHomeUpdate}
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
						requestHistory={socket.requestHistory}
					/>
				}
			/>
			<Route
				path="history/:id"
				element={<PhoneTranscriptScreen socket={socket} />}
			/>
			{phoneBacklogRoutes(socket)}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
