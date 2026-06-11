import type { HistoricalSession } from "./types";

export function uniqueRepos(
	currentCwd: string,
	history: HistoricalSession[],
): string[] {
	const seen = new Set<string>();
	const ordered: string[] = [];
	for (const s of history) {
		if (s.cwd && !seen.has(s.cwd)) {
			seen.add(s.cwd);
			ordered.push(s.cwd);
		}
	}
	if (currentCwd && !seen.has(currentCwd)) ordered.unshift(currentCwd);
	return ordered;
}
