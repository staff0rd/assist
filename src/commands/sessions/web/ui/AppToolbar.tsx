import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import { useLocation, useNavigate } from "react-router";
import { GitStatusCounts } from "./GitStatusCounts";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { OpenInGitHubButton } from "./OpenInGitHubButton";
import { RepoPicker } from "./RepoPicker";
import { TopNavActions } from "./TopNavActions";
import type { RepoSelection } from "./useRepoSelectionContext";
import type { SessionSocket } from "./useSessionSocket";

const TAB_PATHS = ["/sessions", "/backlog"] as const;

const toolbarSx = { minHeight: 48 } as const;
const pickerSx = { width: 240, ml: 2 } as const;

export function AppToolbar({
	socket,
	selection,
}: {
	socket: SessionSocket;
	selection: RepoSelection;
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const tabIndex = TAB_PATHS.findIndex((p) => location.pathname.startsWith(p));

	// Tabs onChange doesn't fire when re-clicking the selected tab, so use
	// per-tab onClick to support navigating back to a section root (e.g. from
	// /backlog/items/:id to /backlog)
	const goTo = (path: string) => {
		if (location.pathname !== path) navigate(path);
	};

	return (
		<Toolbar variant="dense" sx={toolbarSx}>
			<Tabs
				value={tabIndex === -1 ? 0 : tabIndex}
				textColor="inherit"
				indicatorColor="secondary"
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
			<GitStatusCounts cwd={selection.selectedCwd} />
			<Box sx={{ display: "flex", ml: 1, mr: 2 }}>
				<OpenInCodeButton cwd={selection.selectedCwd} />
				<OpenInGitHubButton cwd={selection.selectedCwd} />
			</Box>
			<TopNavActions
				onCreate={socket.createSession}
				onCreateAssist={socket.createAssistSession}
			/>
		</Toolbar>
	);
}
