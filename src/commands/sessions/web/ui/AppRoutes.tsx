import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../commands/backlog/web/ui/BacklogView";
import { NewsView } from "./NewsView";
import { SessionsView } from "./SessionsView";
import type { SessionSocket } from "./useSessionSocket";

function BacklogContent() {
	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
			<BacklogView />
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
			<Route path="backlog/*" element={<BacklogContent />} />
			<Route path="news" element={<NewsView />} />
			<Route path="*" element={<Navigate to="/sessions" replace />} />
		</Routes>
	);
}
