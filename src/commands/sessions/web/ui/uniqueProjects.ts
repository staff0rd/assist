import type { HistoricalSession } from "./types";

export function uniqueProjects(sessions: HistoricalSession[]): string[] {
	const set = new Set<string>();
	for (const s of sessions) set.add(s.project);
	return [...set].sort();
}

export function filterByProject(
	sessions: HistoricalSession[],
	selected: Set<string>,
): HistoricalSession[] {
	if (selected.size === 0) return sessions;
	return sessions.filter((s) => selected.has(s.project));
}
