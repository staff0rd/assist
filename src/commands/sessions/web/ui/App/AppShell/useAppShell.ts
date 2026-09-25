import { selectedCardId } from "./selectedCardId";
import { trackChangedValues } from "./useAppShell/trackChangedValues";
import { useAdoptRepoCard } from "./useAppShell/useAdoptRepoCard";
import { useRepoSelection } from "./useAppShell/useRepoSelection";
import { useSessionLaunch } from "./useAppShell/useSessionLaunch";
import { useSessionSocket } from "../../useSessionSocket";
import { useSidebarCollapsed } from "./useAppShell/useSidebarCollapsed";
import { useTopBarLayout } from "./useAppShell/useTopBarLayout";

export function useAppShell() {
	const socket = useSessionSocket();
	const cardId = selectedCardId(socket);
	const selection = useRepoSelection(
		socket.currentCwd,
		socket.history,
		cardId,
		socket.sessions,
	);
	useAdoptRepoCard({
		selectedCwd: selection.selectedCwd,
		selectedCardId: cardId,
		sessions: socket.sessions,
		history: socket.history,
		activeByRepo: socket.activeByRepo,
		onSelect: socket.selectSession,
	});
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);
	const topBar = useTopBarLayout();
	const sidebarCollapse = useSidebarCollapsed();
	trackChangedValues("shell", {
		...socket,
		selection,
		launch,
		topBar,
		sidebarCollapse,
	});

	return {
		socket,
		selection,
		launch,
		viewLaunchedSession,
		topBar,
		sidebarCollapse,
	};
}
