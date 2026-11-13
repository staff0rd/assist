import { selectedCardId } from "./selectedCardId";
import { trackChangedValues } from "./useAppShell/trackChangedValues";
import { useAdoptRepoCard } from "./useAppShell/useAdoptRepoCard";
import { useRepoSelection } from "./useAppShell/useRepoSelection";
import { useSessionLaunch } from "./useAppShell/useSessionLaunch";
import { useSessionSocket } from "../../useSessionSocket";
import { useSidebarCollapsed } from "./useAppShell/useSidebarCollapsed";
import { useLoadHotkeyBindings } from "./useAppShell/useLoadHotkeyBindings";

export function useAppShell() {
	const socket = useSessionSocket();
	const cardId = selectedCardId(socket);
	const selection = useRepoSelection(
		socket.currentCwd,
		socket.history,
		cardId,
		socket.sessions,
		socket.nodeSelection,
		socket.cloneBaseRepos,
	);
	useAdoptRepoCard({
		selectedCwd: selection.selectedCwd,
		selectedOrigin: selection.originOf(selection.selectedCwd),
		selectedCardId: cardId,
		sessions: socket.sessions,
		history: socket.history,
		activeByRepo: socket.activeByRepo,
		onSelect: socket.selectSession,
	});
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);
	useLoadHotkeyBindings();
	const sidebarCollapse = useSidebarCollapsed();
	trackChangedValues("shell", {
		...socket,
		selection,
		launch,
		sidebarCollapse,
	});

	return {
		socket,
		selection,
		launch,
		viewLaunchedSession,
		sidebarCollapse,
	};
}
