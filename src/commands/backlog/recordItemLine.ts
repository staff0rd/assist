import chalk from "chalk";
import { appendComment } from "./appendComment";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";
import type { BacklogComment } from "./types";

export async function recordItemLine(
	type: BacklogComment["type"],
	id: string,
	text: string,
): Promise<void> {
	const line = text.trim();
	if (!line || line.includes("\n")) {
		console.error(chalk.red(`Error: the ${type} line must be one line.`));
		process.exitCode = 1;
		return;
	}
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}
	await appendComment(found.orm, found.item.id, line, {
		phase: found.item.currentPhase,
		type,
	});
	console.log(
		chalk.green(
			`Recorded the ${type} line on item ${formatItemId(found.item.id)}.`,
		),
	);
}
