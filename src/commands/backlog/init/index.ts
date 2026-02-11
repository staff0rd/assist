import { existsSync } from "node:fs";
import chalk from "chalk";
import { getBacklogPath, saveBacklog } from "../shared";

export async function init(): Promise<void> {
	const backlogPath = getBacklogPath();
	if (existsSync(backlogPath)) {
		console.log(chalk.yellow("assist.backlog.yml already exists."));
		return;
	}
	saveBacklog([]);
	console.log(chalk.green("Created assist.backlog.yml"));
}
