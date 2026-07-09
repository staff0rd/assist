import chalk from "chalk";
import { insertSubtask } from "./insertSubtask";
import { findOneItem } from "./shared";

export async function addSubtask(
	id: string,
	options: { title?: string; desc?: string },
): Promise<void> {
	const title = options.title?.trim();
	if (!title) {
		console.log(chalk.red("A sub-task title is required (--title)."));
		process.exitCode = 1;
		return;
	}

	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}

	const { orm, item } = found;
	const description = options.desc?.replaceAll(String.raw`\n`, "\n");
	await insertSubtask(orm, item.id, title, description);
	console.log(chalk.green(`Added sub-task to item #${id}: ${title}`));
}
