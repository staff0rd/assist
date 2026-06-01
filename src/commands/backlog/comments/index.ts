import chalk from "chalk";
import { formatComment } from "../formatComment";
import { loadAndFindItem } from "../shared";

export async function comments(id: string): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) process.exit(1);

	const { item } = result;
	const entries = item.comments ?? [];

	if (entries.length === 0) {
		console.log(chalk.dim(`No comments on item #${id}.`));
		return;
	}

	console.log(chalk.bold(`Comments for #${id}: ${item.name}\n`));
	for (const entry of entries) {
		console.log(`${formatComment(entry)}\n`);
	}
}
