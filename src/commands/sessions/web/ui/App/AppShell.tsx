import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useMemo } from "react";
import { TransferContext } from "../transfer/useTransferContext";
import { AppRoutes } from "./AppShell/AppRoutes";
import { AppStatusBar } from "./AppShell/AppStatusBar";
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
	const { nodes, transferSession } = socket;
	const transferActions = useMemo(
		() => ({ nodes, transfer: transferSession }),
		[nodes, transferSession],
	);

	return (
		<AppShellProviders shell={shell}>
			<DaemonVersionContext.Provider value={socket.daemonVersion}>
				<HamburgerMenu
					mode={mode}
					toggle={toggle}
					sessions={socket.sessions}
					reconnecting={socket.reconnecting}
				/>
				<AppBar position="fixed" sx={appBarSx} data-testid="toolbar">
					<AppToolbar socket={socket} selection={selection} />
				</AppBar>
				<Toolbar variant="dense" sx={toolbarSx} />
				<TransferContext.Provider value={transferActions}>
					<ServerRunLayer socket={socket}>
						<AppRoutes socket={socket} />
					</ServerRunLayer>
				</TransferContext.Provider>
				<AppStatusBar socket={socket} />
				<AppOverlays
					socket={socket}
					onViewLaunchedSession={viewLaunchedSession}
				/>
			</DaemonVersionContext.Provider>
		</AppShellProviders>
	);
}
