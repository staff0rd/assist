import { useCallback, useMemo } from "react";
import { type RunProps, Sidebar } from "./Sidebar";
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

	const run: RunProps = useMemo(
		() => ({
			configs: socket.runConfigs,
			create: socket.createRunSession,
			requestConfigs: socket.requestRunConfigs,
		}),
		[socket.runConfigs, socket.createRunSession, socket.requestRunConfigs],
	);

	return (
		<Sidebar
			sessions={socket.sessions}
			history={socket.history}
			run={run}
			activeId={socket.activeId}
			currentCwd={socket.currentCwd}
			tab={tab}
			onTabChange={onTabChange}
			onSelect={socket.setActiveId}
			onCreate={socket.createSession}
			onResume={handleResume}
			onRetry={socket.retrySession}
			onDismiss={socket.dismissSession}
		/>
	);
}
