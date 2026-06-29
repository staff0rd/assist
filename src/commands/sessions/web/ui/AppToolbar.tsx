import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { GitStatusCounts } from "./GitStatusCounts";
import { NavTabs } from "./NavTabs";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { OpenInGitHubButton } from "./OpenInGitHubButton";
import { RateLimitsIndicator } from "./RateLimitsIndicator";
import { RepoPicker } from "./RepoPicker";
import { TopNavActions } from "./TopNavActions";
import type { RepoSelection } from "./useRepoSelectionContext";
import type { SessionSocket } from "./useSessionSocket";

const toolbarSx = { minHeight: 48, pr: 14 } as const;
const pickerSx = { width: 240, ml: 2 } as const;

export function AppToolbar({
	socket,
	selection,
}: {
	socket: SessionSocket;
	selection: RepoSelection;
}) {
	return (
		<Toolbar variant="dense" sx={toolbarSx}>
			<NavTabs />
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
			<RateLimitsIndicator rateLimits={socket.rateLimits} />
		</Toolbar>
	);
}
