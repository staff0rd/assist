import chalk from "chalk";
import type { BacklogItem } from "./types";

export function checkSubtasksComplete(id: string, item: BacklogItem): boolean {
	const pending = (item.subtasks ?? []).filter((s) => s.status !== "done");
	if (pending.length === 0) return true;

	console.log(
		chalk.red(
			`Cannot complete item #${id}: ${pending.length} incomplete sub-task(s):`,
		),
	);
	for (const subtask of pending) {
		console.log(chalk.yellow(`  - [${subtask.status}] ${subtask.title}`));
	}
	return false;
}
