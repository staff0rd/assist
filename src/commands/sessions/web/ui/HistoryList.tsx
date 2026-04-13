import { useMemo, useState } from "react";
import { HistoryCard } from "./HistoryCard";
import { ProjectFilter } from "./ProjectFilter";
import type { HistoricalSession } from "./types";

function uniqueProjects(sessions: HistoricalSession[]): string[] {
	const set = new Set<string>();
	for (const s of sessions) set.add(s.project);
	return [...set].sort();
}

function filterByProject(
	sessions: HistoricalSession[],
	selected: Set<string>,
): HistoricalSession[] {
	if (selected.size === 0) return sessions;
	return sessions.filter((s) => selected.has(s.project));
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
	return (
		<div
			style={{ padding: 16, textAlign: "center", color: "#666", fontSize: 13 }}
		>
			{hasAny ? "No sessions match filter" : "No session history"}
		</div>
	);
}

export function HistoryList({
	sessions,
	onResume,
}: {
	sessions: HistoricalSession[];
	onResume: (session: HistoricalSession) => void;
}) {
	const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
		new Set(),
	);

	const projects = useMemo(() => uniqueProjects(sessions), [sessions]);
	const filtered = filterByProject(sessions, selectedProjects);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{projects.length > 1 && (
				<div style={{ padding: "8px 8px 0" }}>
					<ProjectFilter
						projects={projects}
						selected={selectedProjects}
						onChange={setSelectedProjects}
					/>
				</div>
			)}
			<div style={{ flex: 1, overflow: "auto", padding: 8 }}>
				{filtered.map((s) => (
					<HistoryCard key={s.sessionId} session={s} onResume={onResume} />
				))}
				{filtered.length === 0 && <EmptyState hasAny={sessions.length > 0} />}
			</div>
		</div>
	);
}
