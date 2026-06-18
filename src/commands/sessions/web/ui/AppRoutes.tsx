import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../commands/backlog/web/ui/BacklogView";
import { NewsView } from "./NewsView";
import { SessionsView } from "./SessionsView";
import { UsageHistoryView } from "./UsageHistoryView";
import type { SessionSocket } from "./useSessionSocket";

function BacklogContent({ socket }: { socket: SessionSocket }) {
	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
			<BacklogView socket={socket} />
		</Container>
	);
}

export function AppRoutes({ socket }: { socket: SessionSocket }) {
	return (
		<Routes>
			<Route
				path="sessions"
				element={
					<Box
						sx={{
							display: "flex",
							width: "100%",
							height: "calc(100vh - 48px)",
						}}
					>
						<SessionsView socket={socket} />
					</Box>
				}
			/>
			<Route path="backlog/*" element={<BacklogContent socket={socket} />} />
			<Route path="news" element={<NewsView />} />
			<Route path="usage" element={<UsageHistoryView />} />
			<Route path="*" element={<Navigate to="/sessions" replace />} />
		</Routes>
	);
}
