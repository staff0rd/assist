import chalk from "chalk";
import { backlogExists, saveBacklog } from "../shared";

export async function init(): Promise<void> {
	if (backlogExists()) {
		console.log(chalk.yellow("Backlog already exists."));
		return;
	}
	saveBacklog([]);
	console.log(chalk.green("Created backlog."));
}
