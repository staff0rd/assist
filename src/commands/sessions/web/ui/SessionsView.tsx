import Box from "@mui/material/Box";
import { useCallback, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SessionArea } from "./SessionArea";
import type { SidebarTab } from "./types";
import type { SessionSocket } from "./useSessionSocket";

export function SessionsView({ socket }: { socket: SessionSocket }) {
	const [tab, setTab] = useState<SidebarTab>("active");
	const { requestHistory } = socket;

	// History is only pushed on request, so refresh it on each switch to the
	// history view to pick up sessions completed after the initial page load.
	const handleTabChange = useCallback(
		(next: SidebarTab) => {
			if (next === "history") requestHistory();
			setTab(next);
		},
		[requestHistory],
	);

	return (
		<Box sx={{ display: "flex", width: "100%", height: "100%" }}>
			<AppSidebar socket={socket} tab={tab} onTabChange={handleTabChange} />
			<SessionArea
				sessions={socket.sessions}
				activeId={socket.activeId}
				initialized={socket.initialized}
				onOutput={socket.onOutput}
				sendInput={socket.sendInput}
				sendResize={socket.sendResize}
			/>
		</Box>
	);
}
