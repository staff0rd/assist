import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { SessionArea } from "./SessionArea";
import { Sidebar } from "./Sidebar";
import type { HistoricalSession, SidebarTab } from "./types";
import { useSessionSocket } from "./useSessionSocket";

export function App() {
	const socket = useSessionSocket();
	const [tab, setTab] = useState<SidebarTab>("active");

	const handleResume = useCallback(
		(session: HistoricalSession) => {
			socket.resumeSession(session.sessionId, session.cwd, session.name);
			setTab("active");
		},
		[socket.resumeSession],
	);

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<Sidebar
				sessions={socket.sessions}
				history={socket.history}
				activeId={socket.activeId}
				currentCwd={socket.currentCwd}
				tab={tab}
				onTabChange={setTab}
				onSelect={socket.setActiveId}
				onCreate={socket.createSession}
				onResume={handleResume}
				onDismiss={socket.dismissSession}
			/>
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
