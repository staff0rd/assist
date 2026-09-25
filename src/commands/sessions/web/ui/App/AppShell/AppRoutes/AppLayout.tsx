import Box from "@mui/material/Box";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "./AppLayout/AppSidebar";
import { ErrorBoundary } from "./AppLayout/ErrorBoundary";
import { useActivateSession } from "./AppLayout/useActivateSession";
import { DiffPanelsProvider } from "./useDiffPanels";
import { useScrollRestoration } from "./AppLayout/useScrollRestoration";
import { ScrollRestorationContext } from "../../../useScrollRestorationContext";
import type { SessionSocket } from "../../../useSessionSocket";
import { useSidebarCollapsedContext } from "../useSidebarCollapsedContext";
import { useSidebarTab } from "./AppLayout/useSidebarTab";
import { StarredSessionsProvider } from "./useStarredSessions";

export function AppLayout({ socket }: { socket: SessionSocket }) {
	const { pathname } = useLocation();
	const { containerRef, restoration } = useScrollRestoration(pathname);
	const { tab, onTabChange } = useSidebarTab(
		socket.requestHistory,
		socket.clearTranscript,
	);
	const activateSession = useActivateSession(socket.selectSession);
	const { collapsed } = useSidebarCollapsedContext();

	return (
		<StarredSessionsProvider
			sessions={socket.sessions}
			setSessionStarred={socket.setStarred}
		>
			<DiffPanelsProvider
				sessionIds={socket.sessions.map((s) => s.id)}
				onActivateSession={activateSession}
			>
				<Box
					sx={{ display: "flex", width: "100%", height: "calc(100vh - 48px)" }}
				>
					<AppSidebar
						socket={socket}
						tab={tab}
						onTabChange={onTabChange}
						collapsed={collapsed}
					/>
					<Box
						ref={containerRef}
						sx={{
							flex: 1,
							minWidth: 0,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							overflow: "auto",
						}}
					>
						<ScrollRestorationContext.Provider value={restoration}>
							<ErrorBoundary key={pathname}>
								<Outlet />
							</ErrorBoundary>
						</ScrollRestorationContext.Provider>
					</Box>
				</Box>
			</DiffPanelsProvider>
		</StarredSessionsProvider>
	);
}
