import type { FileMetrics } from "./collectFileMetrics";
import type { ResultEntry } from "./ResultEntry";

export function aggregateResults(fileMetrics: FileMetrics): ResultEntry[] {
	const results: ResultEntry[] = [];

	for (const [file, metrics] of fileMetrics) {
		if (metrics.functions.length === 0) continue;
		const avgMaintainability =
			metrics.functions.reduce((a, b) => a + b, 0) / metrics.functions.length;
		const minMaintainability = Math.min(...metrics.functions);
		results.push({
			file,
			avgMaintainability,
			minMaintainability,
			override: metrics.override,
		});
	}

	results.sort((a, b) => a.minMaintainability - b.minMaintainability);
	return results;
}
