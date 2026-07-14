import { useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { sortSessionsByStar } from "./sortSessionsByStar";
import type { SidebarTab } from "./types";
import type { useSessionSocket } from "./useSessionSocket";
import { useSidebarNavigation } from "./useSidebarNavigation";
import { useStarredSessions } from "./useStarredSessions";

type Props = {
	socket: ReturnType<typeof useSessionSocket>;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
};

export function AppSidebar({ socket, tab, onTabChange }: Props) {
	const { isStarred } = useStarredSessions();
	const sessions = useMemo(
		() => sortSessionsByStar(socket.sessions, isStarred),
		[socket.sessions, isStarred],
	);
	const { handleSelect, handleResume, handleView } = useSidebarNavigation(
		socket,
		onTabChange,
	);

	return (
		<Sidebar
			sessions={sessions}
			pendingLaunches={socket.pendingLaunches}
			history={socket.history}
			activeId={socket.activeId}
			tab={tab}
			onTabChange={onTabChange}
			onSelect={handleSelect}
			onDismissPending={socket.dismissPendingLaunch}
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
