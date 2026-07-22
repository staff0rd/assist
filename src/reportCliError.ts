import chalk from "chalk";
import { InvalidItemIdError } from "./commands/backlog/formatItemId";
import { AmbiguousRepoConfigError } from "./shared/resolveRepoOverride";

export function reportCliError(error: unknown): void {
	if (
		error instanceof InvalidItemIdError ||
		error instanceof AmbiguousRepoConfigError
	) {
		console.error(chalk.red(error.message));
	} else {
		console.error(error);
	}
	process.exitCode = 1;
}
