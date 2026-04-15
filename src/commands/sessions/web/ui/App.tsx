import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AppSidebar } from "./AppSidebar";
import { SessionArea } from "./SessionArea";
import type { SidebarTab } from "./types";
import { useSessionSocket } from "./useSessionSocket";

export function App() {
	const socket = useSessionSocket();
	const [tab, setTab] = useState<SidebarTab>("active");

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<AppSidebar socket={socket} tab={tab} onTabChange={setTab} />
			<SessionArea
				sessions={socket.sessions}
				activeId={socket.activeId}
				onOutput={socket.onOutput}
				sendInput={socket.sendInput}
				sendResize={socket.sendResize}
			/>
		</div>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
