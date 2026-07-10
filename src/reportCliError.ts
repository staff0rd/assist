import chalk from "chalk";
import { InvalidItemIdError } from "./commands/backlog/formatItemId";

export function reportCliError(error: unknown): void {
	if (error instanceof InvalidItemIdError) {
		console.error(chalk.red(error.message));
	} else {
		console.error(error);
	}
	process.exitCode = 1;
}
