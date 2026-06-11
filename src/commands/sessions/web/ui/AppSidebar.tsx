import { useCallback } from "react";
import { Sidebar } from "./Sidebar";
import type { HistoricalSession, SidebarTab } from "./types";
import type { useSessionSocket } from "./useSessionSocket";

type Props = {
	socket: ReturnType<typeof useSessionSocket>;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
};

export function AppSidebar({ socket, tab, onTabChange }: Props) {
	const handleResume = useCallback(
		(session: HistoricalSession) => {
			socket.resumeSession(session.sessionId, session.cwd, session.name);
			onTabChange("active");
		},
		[socket.resumeSession, onTabChange],
	);

	const handleView = useCallback(
		(session: HistoricalSession) => {
			socket.viewTranscript(session.sessionId);
		},
		[socket.viewTranscript],
	);

	return (
		<Sidebar
			sessions={socket.sessions}
			history={socket.history}
			activeId={socket.activeId}
			tab={tab}
			onTabChange={onTabChange}
			onSelect={socket.selectSession}
			onView={handleView}
			onResume={handleResume}
			onRetry={socket.retrySession}
			onDismiss={socket.dismissSession}
			onSetAutoRun={socket.setAutoRun}
			onSetAutoAdvance={socket.setAutoAdvance}
			initialized={socket.initialized}
		/>
	);
}
