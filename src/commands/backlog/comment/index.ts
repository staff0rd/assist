import chalk from "chalk";
import { addComment } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export async function comment(id: string, text: string): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) process.exit(1);

	addComment(result.item, text);
	await saveBacklog(result.items);
	console.log(chalk.green(`Comment added to item #${id}.`));
}
