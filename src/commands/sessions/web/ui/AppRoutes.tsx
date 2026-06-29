import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../commands/backlog/web/ui/BacklogView";
import { AppLayout } from "./AppLayout";
import { BackupsView } from "./BackupsView";
import { NewsView } from "./NewsView";
import { SessionArea } from "./SessionArea";
import { UsageHistoryView } from "./UsageHistoryView";
import type { SessionSocket } from "./useSessionSocket";

function BacklogContent({ socket }: { socket: SessionSocket }) {
	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
			<BacklogView socket={socket} />
		</Container>
	);
}

function SessionContent({ socket }: { socket: SessionSocket }) {
	return (
		<SessionArea
			sessions={socket.sessions}
			activeId={socket.activeId}
			initialized={socket.initialized}
			onOutput={socket.onOutput}
			sendInput={socket.sendInput}
			sendResize={socket.sendResize}
			viewingTranscriptSessionId={socket.viewingTranscriptSessionId}
			transcript={socket.transcript}
		/>
	);
}

export function AppRoutes({ socket }: { socket: SessionSocket }) {
	return (
		<Routes>
			<Route element={<AppLayout socket={socket} />}>
				<Route path="sessions" element={<SessionContent socket={socket} />} />
				<Route path="backlog/*" element={<BacklogContent socket={socket} />} />
				<Route path="news" element={<NewsView />} />
				<Route path="usage" element={<UsageHistoryView />} />
				<Route path="backups" element={<BackupsView />} />
				<Route path="*" element={<Navigate to="/sessions" replace />} />
			</Route>
		</Routes>
	);
}
