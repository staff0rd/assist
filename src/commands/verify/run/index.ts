import { filterByChangedFiles } from "./filterByChangedFiles";
import { printMeasureTable } from "./printMeasureTable";
import { resolveEntries } from "./resolveEntries";
import { handleResults, runAllEntries } from "./runAllEntries";
import { setVerbose } from "./spawnCommand";

function printEntryList(entries: { name: string }[]): void {
	console.log(`Running ${entries.length} verify command(s) in parallel:`);
	for (const entry of entries) {
		console.log(`  - ${entry.name}`);
	}
}

export async function run(
	options: { measure?: boolean; all?: boolean; verbose?: boolean } = {},
): Promise<void> {
	setVerbose(!!options.verbose);
	const allEntries = resolveEntries();
	const entries = options.all ? allEntries : filterByChangedFiles(allEntries);

	if (allEntries.length === 0) {
		console.log("No verify commands found");
		return;
	}

	if (entries.length === 0) {
		console.log("No verify commands matched changed files — skipping");
		return;
	}

	printEntryList(entries);
	const { results, totalMs } = await runAllEntries(entries);
	if (options.measure) {
		printMeasureTable(results, totalMs);
	}
	handleResults(results, entries.length);
}
