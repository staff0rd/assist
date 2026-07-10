import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function checkSubtasksComplete(item: BacklogItem): boolean {
	const pending = (item.subtasks ?? []).filter((s) => s.status !== "done");
	if (pending.length === 0) return true;

	console.log(
		chalk.red(
			`Cannot complete item ${formatItemId(item.id)}: ${pending.length} incomplete sub-task(s):`,
		),
	);
	for (const subtask of pending) {
		console.log(chalk.yellow(`  - [${subtask.status}] ${subtask.title}`));
	}
	return false;
}
