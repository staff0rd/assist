import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import { useLocation, useNavigate } from "react-router";
import { AppRoutes } from "./AppRoutes";
import { RepoPicker } from "./RepoPicker";
import { useRepoSelection } from "./useRepoSelection";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { useSessionSocket } from "./useSessionSocket";

const TAB_PATHS = ["/sessions", "/backlog"] as const;

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;
// mr clears the fixed-position ThemeToggle at the toolbar's right edge
const pickerSx = { width: 240, ml: 2, mr: 5 } as const;

export function AppShell() {
	const location = useLocation();
	const navigate = useNavigate();
	const socket = useSessionSocket();
	const selection = useRepoSelection(socket.currentCwd, socket.history);
	const tabIndex = TAB_PATHS.findIndex((p) => location.pathname.startsWith(p));

	// Tabs onChange doesn't fire when re-clicking the selected tab, so use
	// per-tab onClick to support navigating back to a section root (e.g. from
	// /backlog/items/:id to /backlog)
	const goTo = (path: string) => {
		if (location.pathname !== path) navigate(path);
	};

	return (
		<RepoSelectionContext.Provider value={selection}>
			<AppBar position="fixed" elevation={1} sx={appBarSx}>
				<Toolbar variant="dense" sx={toolbarSx}>
					<Tabs
						value={tabIndex === -1 ? 0 : tabIndex}
						textColor="inherit"
						indicatorColor="secondary"
						sx={{ flexGrow: 1 }}
					>
						<Tab label="Sessions" onClick={() => goTo("/sessions")} />
						<Tab label="Backlog" onClick={() => goTo("/backlog")} />
					</Tabs>
					<Box sx={pickerSx}>
						<RepoPicker
							repos={selection.repos}
							selected={selection.selectedCwd}
							onSelect={selection.setSelectedCwd}
						/>
					</Box>
				</Toolbar>
			</AppBar>
			<Toolbar variant="dense" sx={toolbarSx} />
			<AppRoutes socket={socket} />
		</RepoSelectionContext.Provider>
	);
}
