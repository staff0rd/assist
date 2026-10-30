import chalk from "chalk";
import { InvalidItemIdError } from "./commands/backlog/formatItemId";
import { MiroExtractError } from "./commands/miro/MiroExtractError";
import { MissingRunCwdError } from "./commands/run/resolveRunCwd";
import { MissingDatabaseUrlError } from "./shared/db/MissingDatabaseUrlError";
import { UnknownRepoConfigError } from "./shared/resolveNamedRepoWriteLabel";
import { AmbiguousRepoConfigError } from "./shared/resolveRepoOverride";

export function reportCliError(error: unknown): void {
	if (
		error instanceof InvalidItemIdError ||
		error instanceof AmbiguousRepoConfigError ||
		error instanceof UnknownRepoConfigError ||
		error instanceof MissingRunCwdError ||
		error instanceof MiroExtractError ||
		error instanceof MissingDatabaseUrlError
	) {
		console.error(chalk.red(error.message));
	} else {
		console.error(error);
	}
	process.exitCode = 1;
}
