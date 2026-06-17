import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { AppRoutes } from "./AppRoutes";
import { AppToolbar } from "./AppToolbar";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { LaunchSnackbar } from "./LaunchSnackbar";
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
	const navigate = useNavigate();
	const viewLaunchedSession = useCallback(
		(sessionId: string) => {
			socket.selectSession(sessionId);
			navigate("/sessions");
			socket.clearSuccess();
		},
		[navigate, socket.selectSession, socket.clearSuccess],
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
				<LaunchSnackbar
					notice={socket.success}
					onClose={socket.clearSuccess}
					onView={viewLaunchedSession}
				/>
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
}
