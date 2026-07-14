import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { PendingLaunch } from "./PendingLaunch";
import { PendingLaunchCard } from "./PendingLaunchCard";
import { SessionGroups } from "./SessionGroups";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";
import { useStarredSessions } from "./useStarredSessions";

export function SessionList({
	sessions,
	pendingLaunches,
	activeId,
	initialized,
	onSelect,
	onDismissPending,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	sessions: SessionInfo[];
	pendingLaunches: PendingLaunch[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
	onDismissPending: (id: string) => void;
} & SessionListHandlers) {
	const { isStarred } = useStarredSessions();
	const groups = groupSessionsByRepo(sessions, isStarred);

	return (
		<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
			{pendingLaunches.map((launch) => (
				<PendingLaunchCard
					key={launch.id}
					launch={launch}
					onDismiss={onDismissPending}
				/>
			))}
			<SessionGroups
				groups={groups}
				activeId={activeId}
				initialized={initialized}
				onSelect={onSelect}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			{sessions.length === 0 && pendingLaunches.length === 0 && (
				<Typography
					variant="caption"
					color="text.disabled"
					sx={{ display: "block", textAlign: "center", p: 2 }}
				>
					No sessions yet
				</Typography>
			)}
		</Box>
	);
}
