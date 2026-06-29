import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AppRoutes } from "./AppRoutes";
import { AppToolbar } from "./AppToolbar";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { HamburgerMenu } from "./HamburgerMenu";
import { LaunchSnackbar } from "./LaunchSnackbar";
import { ReconnectingIndicator } from "./ReconnectingIndicator";
import { DaemonVersionContext } from "./useDaemonVersionContext";
import { useRepoSelection } from "./useRepoSelection";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { useSessionLaunch } from "./useSessionLaunch";
import { SessionLaunchContext } from "./useSessionLaunchContext";
import { useSessionSocket } from "./useSessionSocket";
import { useSyncRepoToActiveCard } from "./useSyncRepoToActiveCard";

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;

export function AppShell({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
	const socket = useSessionSocket();
	const selection = useRepoSelection(socket.currentCwd, socket.history);
	useSyncRepoToActiveCard(
		socket.activeId,
		socket.sessions,
		socket.history,
		selection.setSelectedCwd,
	);
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);

	return (
		<RepoSelectionContext.Provider value={selection}>
			<SessionLaunchContext.Provider value={launch}>
				<DaemonVersionContext.Provider value={socket.daemonVersion}>
					<HamburgerMenu mode={mode} toggle={toggle} />
				</DaemonVersionContext.Provider>
				<AppBar position="fixed" elevation={1} sx={appBarSx}>
					<AppToolbar socket={socket} selection={selection} />
				</AppBar>
				<Toolbar variant="dense" sx={toolbarSx} />
				<AppRoutes socket={socket} />
				<ReconnectingIndicator reconnecting={socket.reconnecting} />
				<ErrorSnackbar error={socket.error} onClose={socket.clearError} />
				<LaunchSnackbar
					notice={socket.success}
					onClose={socket.clearSuccess}
					onView={viewLaunchedSession}
				/>
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
}
