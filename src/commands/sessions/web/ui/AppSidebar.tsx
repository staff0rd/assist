import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { sortSessionsByStar } from "./sortSessionsByStar";
import type { HistoricalSession, SidebarTab } from "./types";
import type { useSessionSocket } from "./useSessionSocket";
import { useStarredSessions } from "./useStarredSessions";

type Props = {
	socket: ReturnType<typeof useSessionSocket>;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
};

export function AppSidebar({ socket, tab, onTabChange }: Props) {
	const { isStarred } = useStarredSessions();
	const navigate = useNavigate();
	const sessions = useMemo(
		() => sortSessionsByStar(socket.sessions, isStarred),
		[socket.sessions, isStarred],
	);

	/* oxlint-disable react-hooks/exhaustive-deps -- socket methods keep a stable identity; depending on the whole socket object (recreated each render) would needlessly recreate the callback */
	const handleSelect = useCallback(
		(id: string) => {
			socket.selectSession(id);
			navigate("/sessions");
		},
		[socket.selectSession, navigate],
	);

	const handleResume = useCallback(
		(session: HistoricalSession) => {
			socket.resumeSession(session.sessionId, session.cwd, session.name);
			onTabChange("active");
			navigate("/sessions");
		},
		[socket.resumeSession, onTabChange, navigate],
	);

	const handleView = useCallback(
		(session: HistoricalSession) => {
			socket.viewTranscript(session.sessionId);
			navigate("/sessions");
		},
		[socket.viewTranscript, navigate],
	);
	/* oxlint-enable react-hooks/exhaustive-deps */

	return (
		<Sidebar
			sessions={sessions}
			history={socket.history}
			activeId={socket.activeId}
			tab={tab}
			onTabChange={onTabChange}
			onSelect={handleSelect}
			onView={handleView}
			onResume={handleResume}
			onRetry={socket.retrySession}
			onRestart={socket.restartSession}
			onDismiss={socket.dismissSession}
			onSetAutoRun={socket.setAutoRun}
			onSetAutoAdvance={socket.setAutoAdvance}
			initialized={socket.initialized}
		/>
	);
}
