import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useMemo } from "react";
import { AppRoutes } from "./AppRoutes";
import { AppToolbar } from "./AppToolbar";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { ReconnectingIndicator } from "./ReconnectingIndicator";
import { useRepoSelection } from "./useRepoSelection";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { SessionLaunchContext } from "./useSessionLaunchContext";
import { useSessionSocket } from "./useSessionSocket";
import { useSyncRepoToActiveCard } from "./useSyncRepoToActiveCard";

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;

export function AppShell() {
	const socket = useSessionSocket();
	const selection = useRepoSelection(socket.currentCwd, socket.history);
	useSyncRepoToActiveCard(
		socket.activeId,
		socket.sessions,
		socket.history,
		selection.setSelectedCwd,
	);
	const launch = useMemo(
		() => ({ launchAssist: socket.createAssistSession }),
		[socket.createAssistSession],
	);

	return (
		<RepoSelectionContext.Provider value={selection}>
			<SessionLaunchContext.Provider value={launch}>
				<AppBar position="fixed" elevation={1} sx={appBarSx}>
					<AppToolbar socket={socket} selection={selection} />
				</AppBar>
				<Toolbar variant="dense" sx={toolbarSx} />
				<AppRoutes socket={socket} />
				<ReconnectingIndicator reconnecting={socket.reconnecting} />
				<ErrorSnackbar error={socket.error} onClose={socket.clearError} />
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
}
