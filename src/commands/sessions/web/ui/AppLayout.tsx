import Box from "@mui/material/Box";
import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "./AppSidebar";
import type { SidebarTab } from "./types";
import type { SessionSocket } from "./useSessionSocket";
import { StarredSessionsProvider } from "./useStarredSessions";

export function AppLayout({ socket }: { socket: SessionSocket }) {
	const [tab, setTab] = useState<SidebarTab>("active");
	const { requestHistory, clearTranscript } = socket;

	const handleTabChange = useCallback(
		(next: SidebarTab) => {
			if (next === "history") requestHistory();
			else clearTranscript();
			setTab(next);
		},
		[requestHistory, clearTranscript],
	);

	return (
		<StarredSessionsProvider sessions={socket.sessions}>
			<Box
				sx={{ display: "flex", width: "100%", height: "calc(100vh - 48px)" }}
			>
				<AppSidebar socket={socket} tab={tab} onTabChange={handleTabChange} />
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						height: "100%",
						display: "flex",
						flexDirection: "column",
						overflow: "auto",
					}}
				>
					<Outlet />
				</Box>
			</Box>
		</StarredSessionsProvider>
	);
}
