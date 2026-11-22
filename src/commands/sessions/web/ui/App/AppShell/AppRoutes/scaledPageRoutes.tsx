import { Route } from "react-router";
import { AutopilotView } from "./AutopilotView";
import { BackupsView } from "./BackupsView";
import { ConfigView } from "../../ConfigView";
import { ConnectMobileView } from "./ConnectMobileView";
import { NodeScopedDiffView } from "./NodeScopedDiffView";
import { NodeScopedFileView } from "./NodeScopedFileView";
import { InboxView } from "./InboxView";
import { NewsView } from "./NewsView";
import { NextView } from "./NextView";
import { nodesRoutes } from "./nodesRoutes";
import { ReleasesView } from "../../ReleasesView";
import { RulesRoute } from "./RulesRoute";
import { UsageHistoryView } from "../../UsageHistoryView";
import type { SessionSocket } from "../../../useSessionSocket";
import { BacklogContent } from "./BacklogContent";
import { ScaledPages } from "./ScaledPages";

export function scaledPageRoutes(socket: SessionSocket) {
	return (
		<Route element={<ScaledPages />}>
			<Route path="backlog/*" element={<BacklogContent socket={socket} />} />
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
			<Route path="autopilot" element={<AutopilotView />} />
			<Route path="releases" element={<ReleasesView />} />
			<Route path="rules" element={<RulesRoute socket={socket} />} />
			<Route path="usage" element={<UsageHistoryView />} />
			<Route path="backups" element={<BackupsView />} />
			<Route path="config" element={<ConfigView />} />
			<Route path="connect-mobile" element={<ConnectMobileView />} />
			{nodesRoutes(socket.selectSession)}
			<Route path="diff" element={<NodeScopedDiffView socket={socket} />} />
			<Route path="file" element={<NodeScopedFileView socket={socket} />} />
		</Route>
	);
}
