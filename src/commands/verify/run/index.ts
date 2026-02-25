import { filterByChangedFiles } from "./filterByChangedFiles";
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
	options: { timer?: boolean; all?: boolean; verbose?: boolean } = {},
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
	const results = await runAllEntries(entries, options.timer ?? false);
	handleResults(results, entries.length);
}
