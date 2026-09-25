import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AppRoutes } from "./AppShell/AppRoutes";
import { AppOverlays } from "./AppShell/AppOverlays";
import { AppToolbar } from "./AppShell/AppToolbar";
import { HamburgerMenu } from "./AppShell/HamburgerMenu";
import { ServerRunLayer } from "./AppShell/ServerRunLayer";
import { useAppShell } from "./AppShell/useAppShell";
import { DaemonVersionContext } from "./AppShell/useDaemonVersionContext";
import { RepoSelectionContext } from "../useRepoSelectionContext";
import { SessionLaunchContext } from "../useSessionLaunchContext";
import { SidebarCollapsedContext } from "./useSidebarCollapsedContext";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

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
	const {
		socket,
		selection,
		launch,
		viewLaunchedSession,
		topBar,
		sidebarCollapse,
	} = useAppShell();

	return (
		<TopBarLayoutContext.Provider value={topBar}>
			<SidebarCollapsedContext.Provider value={sidebarCollapse}>
				<RepoSelectionContext.Provider value={selection}>
					<SessionLaunchContext.Provider value={launch}>
						<DaemonVersionContext.Provider value={socket.daemonVersion}>
							<HamburgerMenu
								mode={mode}
								toggle={toggle}
								reconnecting={socket.reconnecting}
							/>
						</DaemonVersionContext.Provider>
						<AppBar position="fixed" elevation={1} sx={appBarSx}>
							<AppToolbar socket={socket} selection={selection} />
						</AppBar>
						<Toolbar variant="dense" sx={toolbarSx} />
						<ServerRunLayer socket={socket}>
							<AppRoutes socket={socket} />
						</ServerRunLayer>
						<AppOverlays
							socket={socket}
							onViewLaunchedSession={viewLaunchedSession}
						/>
					</SessionLaunchContext.Provider>
				</RepoSelectionContext.Provider>
			</SidebarCollapsedContext.Provider>
		</TopBarLayoutContext.Provider>
	);
}
