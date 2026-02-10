export type TaskStatus = {
	script: string;
	startTime: number;
	endTime?: number;
	code?: number;
};

function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}
	const seconds = (ms / 1000).toFixed(1);
	return `${seconds}s`;
}

export function printTaskStatuses(tasks: TaskStatus[]): void {
	console.log("\n--- Task Status ---");
	for (const task of tasks) {
		if (task.endTime !== undefined) {
			const duration = formatDuration(task.endTime - task.startTime);
			const status = task.code === 0 ? "✓" : "✗";
			console.log(`  ${status} ${task.script}: ${duration}`);
		} else {
			const elapsed = formatDuration(Date.now() - task.startTime);
			console.log(`  ⋯ ${task.script}: running (${elapsed})`);
		}
	}
	console.log("-------------------\n");
}
