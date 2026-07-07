import chalk from "chalk";
import { findOneItem } from "./shared";
import type { SubtaskStatus } from "./types";
import { updateSubtaskStatus } from "./updateSubtaskStatus";

const validStatuses: SubtaskStatus[] = ["todo", "in-progress", "done"];

export async function subtaskStatus(
	id: string,
	index: string,
	status: string,
): Promise<void> {
	if (!validStatuses.includes(status as SubtaskStatus)) {
		console.log(
			chalk.red(
				`Invalid status "${status}". Use one of: ${validStatuses.join(", ")}.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const position = Number.parseInt(index, 10);
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}

	const { orm, item } = found;
	const subtasks = item.subtasks ?? [];
	if (Number.isNaN(position) || position < 1 || position > subtasks.length) {
		console.log(
			chalk.red(
				`Item #${id} has no sub-task ${index}${subtasks.length > 0 ? ` (1-${subtasks.length})` : ""}.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const title = await updateSubtaskStatus(
		orm,
		item.id,
		position - 1,
		status as SubtaskStatus,
	);
	console.log(
		chalk.green(
			`Set sub-task ${position} of item #${id} to ${status}: ${title}`,
		),
	);
}
