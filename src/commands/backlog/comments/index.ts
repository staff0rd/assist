import chalk from "chalk";
import { formatComment } from "../formatComment";
import { formatItemId } from "../formatItemId";
import { findOneItem } from "../shared";

export async function comments(id: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	const { item } = found;
	const entries = item.comments ?? [];

	if (entries.length === 0) {
		console.log(chalk.dim(`No comments on item ${formatItemId(item.id)}.`));
		return;
	}

	console.log(
		chalk.bold(`Comments for ${formatItemId(item.id)}: ${item.name}\n`),
	);
	for (const entry of entries) {
		console.log(`${formatComment(entry)}\n`);
	}
}
