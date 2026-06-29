import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { HistoryCard } from "./HistoryCard";
import { repoName } from "./RepoList";
import type { HistoricalSession, HistoryCardHandlers } from "./types";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

function EmptyState() {
	return (
		<Typography
			variant="caption"
			color="text.disabled"
			sx={{ display: "block", textAlign: "center", p: 2 }}
		>
			No history for this repo
		</Typography>
	);
}

function HistoryCards({
	sessions,
	onView,
	onResume,
}: { sessions: HistoricalSession[] } & HistoryCardHandlers) {
	return (
		<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
			{sessions.map((s) => (
				<HistoryCard
					key={s.sessionId}
					session={s}
					onView={onView}
					onResume={onResume}
				/>
			))}
			{sessions.length === 0 && <EmptyState />}
		</Box>
	);
}

export function HistoryList({
	sessions,
	onView,
	onResume,
}: { sessions: HistoricalSession[] } & HistoryCardHandlers) {
	const { selectedCwd } = useRepoSelectionContext();
	const filtered = selectedCwd
		? sessions.filter((s) => s.project === repoName(selectedCwd))
		: [];

	return (
		<Box
			sx={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			<HistoryCards sessions={filtered} onView={onView} onResume={onResume} />
		</Box>
	);
}
