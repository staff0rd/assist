import Box from "@mui/material/Box";
import { useLocation } from "react-router";
import { AppSidebar } from "../../AppSidebar";
import { useActivateSession } from "../../../useActivateSession";
import { DiffPanelsProvider } from "../../useDiffPanels";
import type { SessionSocket } from "../../../useSessionSocket";
import { useSidebarCollapsedContext } from "../../useSidebarCollapsedContext";
import { useShowsSidebar } from "./AppLayout/useShowsSidebar";
import { useSidebarTab } from "./AppLayout/useSidebarTab";
import { StarredSessionsProvider } from "../../useStarredSessions";
import { appLayoutSx } from "./AppLayout/appLayoutSx";
import { LayoutContentPane } from "./AppLayout/LayoutContentPane";

export function AppLayout({ socket }: { socket: SessionSocket }) {
	const { pathname } = useLocation();
	const { tab, onTabChange } = useSidebarTab(
		socket.requestHistory,
		socket.clearTranscript,
	);
	const activateSession = useActivateSession(socket.selectSession);
	const { collapsed } = useSidebarCollapsedContext();
	const showSidebar = useShowsSidebar(pathname);

	return (
		<StarredSessionsProvider
			sessions={socket.sessions}
			setSessionStarred={socket.setStarred}
		>
			<DiffPanelsProvider
				sessionIds={socket.sessions.map((s) => s.id)}
				onActivateSession={activateSession}
			>
				<Box sx={appLayoutSx}>
					{showSidebar && (
						<AppSidebar
							socket={socket}
							tab={tab}
							onTabChange={onTabChange}
							collapsed={collapsed}
						/>
					)}
					<LayoutContentPane pathname={pathname} />
				</Box>
			</DiffPanelsProvider>
		</StarredSessionsProvider>
	);
}
