import chalk from "chalk";
import { deleteSubtask } from "./deleteSubtask";
import { formatItemId } from "./formatItemId";
import { findSubtask } from "./findSubtask";

export async function removeSubtask(id: string, index: string): Promise<void> {
	const found = await findSubtask(id, index);
	if (!found) return;

	const { orm, item, idx } = found;
	const title = await deleteSubtask(orm, item.id, idx);
	console.log(
		chalk.green(
			`Removed sub-task ${idx + 1} of item ${formatItemId(item.id)}: ${title}`,
		),
	);
}
