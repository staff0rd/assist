import { Route } from "react-router";
import { PhoneHistoryList } from "./PhoneHistoryList";
import type { PhoneRoutesProps } from "./PhoneRoutes";
import { PhoneSessionList } from "./PhoneSessionList";
import { PhoneSessionScreen } from "./PhoneSessionScreen";
import { PhoneTranscriptScreen } from "./PhoneTranscriptScreen";

export function phoneSessionRoutes(
	{ socket, keyboardOpen, onOpenNodes, onNewSession }: PhoneRoutesProps,
	refresh: () => void,
) {
	const localNode = socket.nodes?.local;
	return (
		<>
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
						requestHistory={socket.requestHistory}
					/>
				}
			/>
			<Route
				path="history/:id"
				element={<PhoneTranscriptScreen socket={socket} />}
			/>
		</>
	);
}
