import type { MeasureRecord } from "./printMeasureTable";
import type { VerifyEntry } from "./resolveEntries";
import { collectOutput, flushIfFailed, spawnCommand } from "./spawnCommand";

function logFailedScripts(failed: MeasureRecord[]): void {
	console.error(`\n${failed.length} script(s) failed:`);
	for (const f of failed) {
		console.error(`  - ${f.script} (exit code ${f.code})`);
	}
}

function runEntry(entry: VerifyEntry): Promise<MeasureRecord> {
	return new Promise((resolve) => {
		const startTime = Date.now();
		const child = spawnCommand(
			entry.fullCommand,
			entry.cwd,
			entry.env,
			entry.quiet,
		);
		const chunks = collectOutput(child, entry.quiet);

		child.on("close", (code) => {
			const exitCode = code ?? 1;
			flushIfFailed(exitCode, chunks);
			resolve({
				script: entry.name,
				code: exitCode,
				durationMs: Date.now() - startTime,
			});
		});
	});
}

function exitIfFailed(failed: MeasureRecord[]): void {
	if (failed.length === 0) return;
	logFailedScripts(failed);
	process.exit(1);
}

export async function runAllEntries(
	entries: VerifyEntry[],
): Promise<{ results: MeasureRecord[]; totalMs: number }> {
	const startTime = Date.now();
	const results = await Promise.all(entries.map((entry) => runEntry(entry)));
	return { results, totalMs: Date.now() - startTime };
}

export function handleResults(
	results: MeasureRecord[],
	totalCount: number,
): void {
	exitIfFailed(results.filter((r) => r.code !== 0));
	console.log(`\nAll ${totalCount} verify command(s) passed`);
}
