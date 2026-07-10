import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { findSubtask } from "./findSubtask";
import type { SubtaskStatus } from "./types";
import { type SubtaskUpdate, updateSubtask } from "./updateSubtask";
import { validSubtaskStatuses } from "./validSubtaskStatuses";

function buildUpdate(options: {
	title?: string;
	desc?: string;
	status?: string;
}): SubtaskUpdate | string {
	const fields: SubtaskUpdate = {};

	if (options.title !== undefined) {
		const title = options.title.trim();
		if (!title) return "A sub-task title cannot be empty (--title).";
		fields.title = title;
	}

	if (options.status !== undefined) {
		if (!validSubtaskStatuses.includes(options.status as SubtaskStatus)) {
			return `Invalid status "${options.status}". Use one of: ${validSubtaskStatuses.join(", ")}.`;
		}
		fields.status = options.status as SubtaskStatus;
	}

	if (options.desc !== undefined) {
		fields.description =
			options.desc === ""
				? null
				: options.desc.replaceAll(String.raw`\n`, "\n");
	}

	if (Object.keys(fields).length === 0) {
		return "Nothing to update. Provide at least one of --title, --desc, --status.";
	}

	return fields;
}

export async function editSubtask(
	id: string,
	index: string,
	options: { title?: string; desc?: string; status?: string },
): Promise<void> {
	const found = await findSubtask(id, index);
	if (!found) return;

	const fields = buildUpdate(options);
	if (typeof fields === "string") {
		console.log(chalk.red(fields));
		process.exitCode = 1;
		return;
	}

	const { orm, item, idx } = found;
	const title = await updateSubtask(orm, item.id, idx, fields);
	console.log(
		chalk.green(
			`Updated sub-task ${idx + 1} of item ${formatItemId(item.id)}: ${title}`,
		),
	);
}
