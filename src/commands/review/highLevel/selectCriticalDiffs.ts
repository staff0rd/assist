import { minimatch } from "minimatch";
import type { HighLevelCriticalDiff, HighLevelFile } from "./types";

export function selectCriticalDiffs(
	files: HighLevelFile[],
	criticalPaths: string[],
): HighLevelCriticalDiff[] {
	if (criticalPaths.length === 0) return [];
	return files
		.filter((file) => criticalPaths.some((glob) => minimatch(file.path, glob)))
		.map(({ path, status, additions, deletions, diffUrl, patch }) => ({
			path,
			status,
			additions,
			deletions,
			diffUrl,
			patch: patch ?? null,
		}));
}
