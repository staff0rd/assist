import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { HistoryCard } from "./HistoryList/HistoryCard";
import {
	repoGroupCwd,
	repoGroupKey,
	repoKeyForCwd,
} from "../../../../../../../repoGroupKey";
import type {
	HistoricalSession,
	HistoryCardHandlers,
} from "../../../../../../../types";
import { useRepoSelectionContext } from "../../../../../../../useRepoSelectionContext";

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
	const selectedKey = repoKeyForCwd(selectedCwd, sessions);
	// why: uniqueRepos renders one row per clone even if two groups disagree on origin, so match the clone too or the suppressed group's sessions become unreachable
	const filtered = selectedCwd
		? sessions.filter(
				(s) =>
					repoGroupKey(s) === selectedKey || repoGroupCwd(s) === selectedCwd,
			)
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
