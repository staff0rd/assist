import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { MachinePicker } from "./AppToolbar/MachinePicker";
import { NavTabs } from "./AppToolbar/NavTabs";
import { NewSessionButton } from "./AppToolbar/NewSessionButton";
import { OpenInCodeButton } from "../OpenInCodeButton";
import { OpenInGitHubButton } from "./AppToolbar/OpenInGitHubButton";
import { RefreshWebserverButton } from "./AppToolbar/RefreshWebserverButton";
import { RepoPicker } from "./AppToolbar/RepoPicker";
import { SidebarCollapseToggle } from "../SidebarCollapseToggle";
import { TopNavActions } from "./AppToolbar/TopNavActions";
import type { RepoSelection } from "../../useRepoSelectionContext";
import type { SessionSocket } from "../../useSessionSocket";
import { useSidebarCollapsedContext } from "../useSidebarCollapsedContext";

const toolbarSx = { minHeight: 48, pl: 1, pr: 14 } as const;
const itemsSx = {
	flex: 1,
	minWidth: 0,
	display: "flex",
	alignItems: "center",
	overflowX: { xs: "auto", sm: "visible" },
	scrollbarWidth: "none",
	"&::-webkit-scrollbar": { display: "none" },
} as const;

export function AppToolbar({
	socket,
	selection,
}: {
	socket: SessionSocket;
	selection: RepoSelection;
}) {
	const { collapsed, onToggleCollapsed } = useSidebarCollapsedContext();

	return (
		<Toolbar variant="dense" disableGutters sx={toolbarSx}>
			<Box sx={itemsSx}>
				{collapsed && (
					<SidebarCollapseToggle
						collapsed={collapsed}
						onToggleCollapsed={onToggleCollapsed}
					/>
				)}
				<RefreshWebserverButton reconnecting={socket.reconnecting} />
				<NavTabs cwd={selection.selectedCwd} />
				<MachinePicker />
				<RepoPicker
					repos={selection.repos}
					selected={selection.selectedCwd}
					onSelect={selection.setSelectedCwd}
				/>
				<Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
					<OpenInCodeButton cwd={selection.selectedCwd} />
					<OpenInGitHubButton cwd={selection.selectedCwd} />
					<NewSessionButton />
				</Box>
				<TopNavActions
					onCreateAssist={socket.createAssistSession}
					onStartRun={socket.startRun}
				/>
			</Box>
		</Toolbar>
	);
}
