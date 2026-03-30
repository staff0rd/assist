import chalk from "chalk";
import { addComment } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export function comment(id: string, text: string): void {
	const result = loadAndFindItem(id);
	if (!result) process.exit(1);

	addComment(result.item, text);
	saveBacklog(result.items);
	console.log(chalk.green(`Comment added to item #${id}.`));
}
