import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./AppRoutes/AppLayout";
import { BackupsView } from "./AppRoutes/BackupsView";
import { ConfigView } from "../ConfigView";
import { ConnectMobileView } from "./AppRoutes/ConnectMobileView";
import { NodeScopedDiffView } from "./AppRoutes/NodeScopedDiffView";
import { NodeScopedFileView } from "./AppRoutes/NodeScopedFileView";
import { InboxView } from "./AppRoutes/InboxView";
import { NewsView } from "./AppRoutes/NewsView";
import { NextView } from "./AppRoutes/NextView";
import { nodesRoutes } from "./AppRoutes/nodesRoutes";
import { ReleasesView } from "../ReleasesView";
import { RulesView } from "../RulesView";
import { countRender } from "../../renderCounters";
import { RenderRateHud } from "./AppRoutes/RenderRateHud";
import { SessionContent } from "../SessionContent";
import { UsageHistoryView } from "../UsageHistoryView";
import type { SessionSocket } from "../../useSessionSocket";
import { BacklogContent } from "./AppRoutes/BacklogContent";

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
					<Route
						path="next"
						element={
							<NextView
								sessions={socket.sessions}
								selectSession={socket.selectSession}
							/>
						}
					/>
					<Route path="news" element={<NewsView />} />
					<Route path="inbox" element={<InboxView />} />
					<Route path="releases" element={<ReleasesView />} />
					<Route path="rules" element={<RulesView />} />
					<Route path="usage" element={<UsageHistoryView />} />
					<Route path="backups" element={<BackupsView />} />
					<Route path="config" element={<ConfigView />} />
					<Route path="connect-mobile" element={<ConnectMobileView />} />
					{nodesRoutes(socket.selectSession)}
					<Route path="diff" element={<NodeScopedDiffView socket={socket} />} />
					<Route path="file" element={<NodeScopedFileView socket={socket} />} />
					<Route path="*" element={<Navigate to="/sessions" replace />} />
				</Route>
			</Routes>
		</>
	);
}
