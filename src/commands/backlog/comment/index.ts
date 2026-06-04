import chalk from "chalk";
import { appendComment } from "../appendComment";
import { findOneItem } from "../shared";

export async function comment(id: string, text: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	await appendComment(found.orm, found.item.id, text);
	console.log(chalk.green(`Comment added to item #${id}.`));
}
