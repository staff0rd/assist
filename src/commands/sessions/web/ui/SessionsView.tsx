import Box from "@mui/material/Box";
import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SessionArea } from "./SessionArea";
import type { SidebarTab } from "./types";
import type { useSessionSocket } from "./useSessionSocket";

type Props = {
	socket: ReturnType<typeof useSessionSocket>;
};

export function SessionsView({ socket }: Props) {
	const [tab, setTab] = useState<SidebarTab>("active");

	return (
		<Box sx={{ display: "flex", width: "100%", height: "100%" }}>
			<AppSidebar socket={socket} tab={tab} onTabChange={setTab} />
			<SessionArea
				sessions={socket.sessions}
				activeId={socket.activeId}
				onOutput={socket.onOutput}
				sendInput={socket.sendInput}
				sendResize={socket.sendResize}
			/>
		</Box>
	);
}
