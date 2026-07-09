import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import { SessionGroups } from "./SessionGroups";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";
import { useStarredSessions } from "./useStarredSessions";

export function SessionList({
	sessions,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const { isStarred } = useStarredSessions();
	const groups = groupSessionsByRepo(sessions, isStarred);

	return (
		<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
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
			{sessions.length === 0 && (
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
