import {
	repoGroupCwd,
	repoGroupKey,
	repoKeyForCwd,
} from "../../../../repoGroupKey";
import type { HistoricalSession } from "../../../../types";

export function uniqueRepos(
	currentCwd: string,
	history: HistoricalSession[],
): string[] {
	const seenKeys = new Set<string>();
	const seenCwds = new Set<string>();
	const ordered: string[] = [];
	for (const s of history) {
		if (s.cwdMissing) continue;
		const key = repoGroupKey(s);
		const cwd = repoGroupCwd(s);
		if (!key || !cwd || seenKeys.has(key) || seenCwds.has(cwd)) continue;
		seenKeys.add(key);
		seenCwds.add(cwd);
		ordered.push(cwd);
	}
	if (
		currentCwd &&
		!seenKeys.has(repoKeyForCwd(currentCwd, history)) &&
		!seenCwds.has(currentCwd)
	)
		ordered.unshift(currentCwd);
	return ordered;
}
