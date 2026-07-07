import chalk from "chalk";
import type { BacklogItem } from "../types";

export function printSubtasks(item: BacklogItem): void {
	const subtasks = item.subtasks ?? [];
	if (subtasks.length === 0) return;

	console.log(chalk.bold("Sub-tasks"));
	for (const [i, subtask] of subtasks.entries()) {
		const status = chalk.dim(`[${subtask.status}]`);
		console.log(`  ${i + 1}. ${status} ${subtask.title}`);
		if (subtask.description) {
			console.log(`     ${chalk.dim(subtask.description)}`);
		}
	}
	console.log();
}
