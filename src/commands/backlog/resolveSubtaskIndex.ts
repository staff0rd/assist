import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function resolveSubtaskIndex(
	index: string,
	item: BacklogItem,
): number | undefined {
	const position = Number.parseInt(index, 10);
	const subtasks = item.subtasks ?? [];
	if (Number.isNaN(position) || position < 1 || position > subtasks.length) {
		console.log(
			chalk.red(
				`Item ${formatItemId(item.id)} has no sub-task ${index}${subtasks.length > 0 ? ` (1-${subtasks.length})` : ""}.`,
			),
		);
		process.exitCode = 1;
		return undefined;
	}
	return position - 1;
}
