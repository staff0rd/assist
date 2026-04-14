import type { HistoricalSession } from "./types";

export function uniqueRepos(
	currentCwd: string,
	history: HistoricalSession[],
): string[] {
	const set = new Set<string>();
	if (currentCwd) set.add(currentCwd);
	for (const s of history) if (s.cwd) set.add(s.cwd);
	return [...set].sort((a, b) => a.localeCompare(b));
}
