import Container from "@mui/material/Container";
import { Navigate, Route, Routes } from "react-router";
import { BacklogView } from "../../../../../backlog/web/ui/BacklogView";
import { AppLayout } from "./AppRoutes/AppLayout";
import { BackupsView } from "./AppRoutes/BackupsView";
import { ConfigView } from "../ConfigView";
import { NodeScopedDiffView } from "./AppRoutes/NodeScopedDiffView";
import { NodeScopedFileView } from "./AppRoutes/NodeScopedFileView";
import { NewsView } from "./AppRoutes/NewsView";
import { ReleasesView } from "../ReleasesView";
import { countRender } from "../../renderCounters";
import { RenderRateHud } from "./AppRoutes/RenderRateHud";
import { SessionContent } from "../SessionContent";
import { UsageHistoryView } from "../UsageHistoryView";
import type { SessionSocket } from "../../useSessionSocket";

function BacklogContent({ socket }: { socket: SessionSocket }) {
	return (
		<Container maxWidth="lg" sx={{ py: 3, px: 2 }}>
			<BacklogView socket={socket} />
		</Container>
	);
}

export function AppRoutes({ socket }: { socket: SessionSocket }) {
	countRender("AppRoutes");

	return (
		<>
			<RenderRateHud />
			<Routes>
				<Route element={<AppLayout socket={socket} />}>
					<Route path="sessions" element={<SessionContent socket={socket} />} />
					<Route
						path="backlog/*"
						element={<BacklogContent socket={socket} />}
					/>
					<Route path="news" element={<NewsView />} />
					<Route path="releases" element={<ReleasesView />} />
					<Route path="usage" element={<UsageHistoryView />} />
					<Route path="backups" element={<BackupsView />} />
					<Route path="config" element={<ConfigView />} />
					<Route path="diff" element={<NodeScopedDiffView socket={socket} />} />
					<Route path="file" element={<NodeScopedFileView socket={socket} />} />
					<Route path="*" element={<Navigate to="/sessions" replace />} />
				</Route>
			</Routes>
		</>
	);
}
