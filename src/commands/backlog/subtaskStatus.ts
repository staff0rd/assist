import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { findSubtask } from "./findSubtask";
import type { SubtaskStatus } from "./types";
import { updateSubtaskStatus } from "./updateSubtaskStatus";
import { validSubtaskStatuses } from "./validSubtaskStatuses";

export async function subtaskStatus(
	id: string,
	index: string,
	status: string,
): Promise<void> {
	if (!validSubtaskStatuses.includes(status as SubtaskStatus)) {
		console.log(
			chalk.red(
				`Invalid status "${status}". Use one of: ${validSubtaskStatuses.join(", ")}.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const found = await findSubtask(id, index);
	if (!found) return;

	const { orm, item, idx } = found;
	const title = await updateSubtaskStatus(
		orm,
		item.id,
		idx,
		status as SubtaskStatus,
	);
	console.log(
		chalk.green(
			`Set sub-task ${idx + 1} of item ${formatItemId(item.id)} to ${status}: ${title}`,
		),
	);
}
