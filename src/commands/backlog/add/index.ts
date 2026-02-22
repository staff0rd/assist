import { existsSync } from "node:fs";
import chalk from "chalk";
import { getBacklogPath, getNextId, loadBacklog, saveBacklog } from "../shared";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

export async function add(): Promise<void> {
	const backlogPath = getBacklogPath();
	if (!existsSync(backlogPath)) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}

	const type = await promptType();
	const name = await promptName();
	const description = await promptDescription();
	const acceptanceCriteria = await promptAcceptanceCriteria();

	const items = loadBacklog();
	const id = getNextId(items);
	items.push({
		id,
		type,
		name,
		description,
		acceptanceCriteria,
		status: "todo",
	});
	saveBacklog(items);
	console.log(chalk.green(`Added item #${id}: ${name}`));
}
