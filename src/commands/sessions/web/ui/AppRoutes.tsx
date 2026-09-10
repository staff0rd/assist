import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../commands/backlog/web/ui/BacklogView";
import { AppLayout } from "./AppLayout";
import { BackupsView } from "./BackupsView";
import { ConfigView } from "./ConfigView";
import { DiffView } from "./DiffView";
import { FileView } from "./FileView";
import { NewsView } from "./NewsView";
import { SessionContent } from "./SessionContent";
import { UsageHistoryView } from "./UsageHistoryView";
import type { SessionSocket } from "./useSessionSocket";

function BacklogContent({ socket }: { socket: SessionSocket }) {
	return (
		<Container maxWidth="lg" sx={{ py: 3, px: 2 }}>
			<BacklogView socket={socket} />
		</Container>
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
				<Route path="config" element={<ConfigView />} />
				<Route
					path="diff"
					element={
						<DiffView sessions={socket.sessions} sendInput={socket.sendInput} />
					}
				/>
				<Route path="file" element={<FileView />} />
				<Route path="*" element={<Navigate to="/sessions" replace />} />
			</Route>
		</Routes>
	);
}
