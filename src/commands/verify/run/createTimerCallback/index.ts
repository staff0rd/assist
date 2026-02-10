import { printTaskStatuses, type TaskStatus } from "./printTaskStatuses";

export function logFailedScripts(
	failed: { script: string; code: number }[],
): void {
	console.error(`\n${failed.length} script(s) failed:`);
	for (const f of failed) {
		console.error(`  - ${f.script} (exit code ${f.code})`);
	}
}

export function createTimerCallback(
	taskStatuses: TaskStatus[],
	index: number,
): (exitCode: number) => void {
	return (exitCode) => {
		taskStatuses[index].endTime = Date.now();
		taskStatuses[index].code = exitCode;
		printTaskStatuses(taskStatuses);
	};
}

export function initTaskStatuses(scripts: string[]): TaskStatus[] {
	return scripts.map((script) => ({ script, startTime: Date.now() }));
}
