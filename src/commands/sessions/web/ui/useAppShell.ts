import { useAdoptRepoCard } from "./useAdoptRepoCard";
import { useRepoSelection } from "./useRepoSelection";
import { useSessionLaunch } from "./useSessionLaunch";
import { useSessionSocket } from "./useSessionSocket";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import { useTopBarLayout } from "./useTopBarLayout";

export function useAppShell() {
	const socket = useSessionSocket();
	const selectedCardId = socket.viewingTranscriptSessionId ?? socket.activeId;
	const selection = useRepoSelection(
		socket.currentCwd,
		socket.history,
		selectedCardId,
		socket.sessions,
	);
	useAdoptRepoCard({
		selectedCwd: selection.selectedCwd,
		selectedCardId,
		sessions: socket.sessions,
		history: socket.history,
		activeByRepo: socket.activeByRepo,
		onSelect: socket.selectSession,
	});
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);
	const topBar = useTopBarLayout();
	const sidebarCollapse = useSidebarCollapsed();

	return {
		socket,
		selection,
		launch,
		viewLaunchedSession,
		topBar,
		sidebarCollapse,
	};
}
