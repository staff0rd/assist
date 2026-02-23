import { minimatch } from "minimatch";
import { getChangedFiles } from "./getChangedFiles";
import type { VerifyEntry } from "./resolveEntries";

export function filterByChangedFiles(entries: VerifyEntry[]): VerifyEntry[] {
	const hasFilters = entries.some((e) => e.filter);
	if (!hasFilters) return entries;

	const changedFiles = getChangedFiles();

	return entries.filter((entry) => {
		const { filter } = entry;
		if (!filter) return true;
		if (changedFiles.length === 0) return false;
		return changedFiles.some((file) => minimatch(file, filter));
	});
}
