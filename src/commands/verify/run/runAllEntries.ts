import {
	createTimerCallback,
	initTaskStatuses,
	logFailedScripts,
} from "./createTimerCallback";
import type { VerifyEntry } from "./resolveEntries";
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

function exitIfFailed(failed: { script: string; code: number }[]): void {
	if (failed.length === 0) return;
	logFailedScripts(failed);
	process.exit(1);
}

export function runAllEntries(entries: VerifyEntry[], timer: boolean) {
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

export function handleResults(
	results: { script: string; code: number }[],
	totalCount: number,
): void {
	exitIfFailed(results.filter((r) => r.code !== 0));
	console.log(`\nAll ${totalCount} verify command(s) passed`);
}
