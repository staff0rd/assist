import {
	createTimerCallback,
	initTaskStatuses,
	logFailedScripts,
} from "./createTimerCallback";
import { filterByChangedFiles } from "./filterByChangedFiles";
import { resolveEntries, type VerifyEntry } from "./resolveEntries";
import { collectOutput, flushIfFailed, spawnCommand } from "./spawnCommand";

function runEntry(
	entry: VerifyEntry,
	onComplete?: (code: number) => void,
): Promise<{ script: string; code: number }> {
	return new Promise((resolve) => {
		const child = spawnCommand(entry.fullCommand, entry.cwd, entry.env);
		const chunks = collectOutput(child);

		child.on("close", (code) => {
			const exitCode = code ?? 1;
			flushIfFailed(exitCode, chunks);
			onComplete?.(exitCode);
			resolve({ script: entry.name, code: exitCode });
		});
	});
}

function runAllEntries(entries: VerifyEntry[], timer: boolean) {
	const taskStatuses = initTaskStatuses(entries.map((e) => e.name));
	return Promise.all(
		entries.map((entry, index) =>
			runEntry(
				entry,
				timer ? createTimerCallback(taskStatuses, index) : undefined,
			),
		),
	);
}

function printEntryList(entries: VerifyEntry[]): void {
	console.log(`Running ${entries.length} verify command(s) in parallel:`);
	for (const entry of entries) {
		console.log(`  - ${entry.name}`);
	}
}

function exitIfFailed(failed: { script: string; code: number }[]): void {
	if (failed.length === 0) return;
	logFailedScripts(failed);
	process.exit(1);
}

function handleResults(
	results: { script: string; code: number }[],
	totalCount: number,
): void {
	exitIfFailed(results.filter((r) => r.code !== 0));
	console.log(`\nAll ${totalCount} verify command(s) passed`);
}

export async function run(
	options: { timer?: boolean; all?: boolean } = {},
): Promise<void> {
	const allEntries = resolveEntries();

	if (allEntries.length === 0) {
		console.log("No verify commands found");
		return;
	}

	const entries = options.all ? allEntries : filterByChangedFiles(allEntries);

	if (entries.length === 0) {
		console.log("No verify commands matched changed files — skipping");
		return;
	}

	printEntryList(entries);
	const results = await runAllEntries(entries, options.timer ?? false);
	handleResults(results, entries.length);
}
