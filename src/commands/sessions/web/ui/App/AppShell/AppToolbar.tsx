import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { NavTabs } from "./AppToolbar/NavTabs";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { OpenInGitHubButton } from "./AppToolbar/OpenInGitHubButton";
import { RateLimitsIndicator } from "./AppToolbar/RateLimitsIndicator";
import { RefreshWebserverButton } from "./AppToolbar/RefreshWebserverButton";
import { RepoPicker } from "./AppToolbar/RepoPicker";
import { SidebarCollapseToggle } from "./SidebarCollapseToggle";
import { TopNavActions } from "./AppToolbar/TopNavActions";
import type { RepoSelection } from "../../useRepoSelectionContext";
import type { SessionSocket } from "../../useSessionSocket";
import { useSidebarCollapsedContext } from "./useSidebarCollapsedContext";

const toolbarSx = { minHeight: 48, pl: 1, pr: 14 } as const;
const pickerSx = { width: 240, ml: 2 } as const;

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
			{collapsed && (
				<SidebarCollapseToggle
					collapsed={collapsed}
					onToggleCollapsed={onToggleCollapsed}
				/>
			)}
			<RefreshWebserverButton reconnecting={socket.reconnecting} />
			<NavTabs />
			<Box sx={pickerSx}>
				<RepoPicker
					repos={selection.repos}
					selected={selection.selectedCwd}
					onSelect={selection.setSelectedCwd}
				/>
			</Box>
			<Box sx={{ display: "flex", ml: 1, mr: 2 }}>
				<OpenInCodeButton cwd={selection.selectedCwd} />
				<OpenInGitHubButton cwd={selection.selectedCwd} />
			</Box>
			<TopNavActions
				onCreate={socket.createSession}
				onCreateDesign={socket.createDesignSession}
				onCreateHarness={socket.createHarnessSession}
				onCreateAssist={socket.createAssistSession}
				onStartRun={socket.startRun}
			/>
			<RateLimitsIndicator
				rateLimits={socket.rateLimits}
				harnessRateLimits={socket.harnessRateLimits}
			/>
		</Toolbar>
	);
}
