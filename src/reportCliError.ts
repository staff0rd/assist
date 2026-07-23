import chalk from "chalk";
import { InvalidItemIdError } from "./commands/backlog/formatItemId";
import { UnknownRepoConfigError } from "./shared/resolveNamedRepoWriteLabel";
import { AmbiguousRepoConfigError } from "./shared/resolveRepoOverride";

export function reportCliError(error: unknown): void {
	if (
		error instanceof InvalidItemIdError ||
		error instanceof AmbiguousRepoConfigError ||
		error instanceof UnknownRepoConfigError
	) {
		console.error(chalk.red(error.message));
	} else {
		console.error(error);
	}
	process.exitCode = 1;
}
