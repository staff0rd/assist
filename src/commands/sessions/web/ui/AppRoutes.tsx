import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../commands/backlog/web/ui/BacklogView";
import { SessionsView } from "./SessionsView";

function BacklogContent() {
	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
			<BacklogView />
		</Container>
	);
}

export function AppRoutes() {
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
						<SessionsView />
					</Box>
				}
			/>
			<Route path="backlog/*" element={<BacklogContent />} />
			<Route path="*" element={<Navigate to="/sessions" replace />} />
		</Routes>
	);
}
