import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useMemo } from "react";
import { AppRoutes } from "./AppRoutes";
import { AppToolbar } from "./AppToolbar";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { useRepoSelection } from "./useRepoSelection";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { SessionLaunchContext } from "./useSessionLaunchContext";
import { useSessionSocket } from "./useSessionSocket";

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;

export function AppShell() {
	const socket = useSessionSocket();
	const selection = useRepoSelection(socket.currentCwd, socket.history);
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
				<ErrorSnackbar error={socket.error} onClose={socket.clearError} />
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>
	);
}
