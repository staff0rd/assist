import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AppRoutes } from "./AppShell/AppRoutes";
import { AppOverlays } from "./AppShell/AppOverlays";
import { AppShellProviders } from "./AppShell/AppShellProviders";
import { AppToolbar } from "./AppShell/AppToolbar";
import { HamburgerMenu } from "./AppShell/HamburgerMenu";
import { ServerRunLayer } from "./AppShell/ServerRunLayer";
import { useAppShell } from "./AppShell/useAppShell";
import { DaemonVersionContext } from "./AppShell/useDaemonVersionContext";

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
	const shell = useAppShell();
	const { socket, selection, viewLaunchedSession } = shell;

	return (
		<AppShellProviders shell={shell}>
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
		</AppShellProviders>
	);
}
