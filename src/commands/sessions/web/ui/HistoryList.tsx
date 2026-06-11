import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { HistoryCard } from "./HistoryCard";
import { ProjectFilter } from "./ProjectFilter";
import type { HistoricalSession, HistoryCardHandlers } from "./types";
import { filterByProject, uniqueProjects } from "./uniqueProjects";

function EmptyState({ hasAny }: { hasAny: boolean }) {
	return (
		<Typography
			variant="caption"
			color="text.disabled"
			sx={{ display: "block", textAlign: "center", p: 2 }}
		>
			{hasAny ? "No sessions match filter" : "No session history"}
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
			{sessions.length === 0 && <EmptyState hasAny={false} />}
		</Box>
	);
}

export function HistoryList({
	sessions,
	onView,
	onResume,
}: { sessions: HistoricalSession[] } & HistoryCardHandlers) {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const projects = useMemo(() => uniqueProjects(sessions), [sessions]);
	const filtered = filterByProject(sessions, selected);

	return (
		<Box
			sx={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{projects.length > 1 && (
				<Box sx={{ px: 1, pt: 1 }}>
					<ProjectFilter
						projects={projects}
						selected={selected}
						onChange={setSelected}
					/>
				</Box>
			)}
			<HistoryCards sessions={filtered} onView={onView} onResume={onResume} />
		</Box>
	);
}
