import chalk from "chalk";
import { isDbBackedConfigKey } from "./dbBackedConfigKeys";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { resolveRepoUnsetTarget } from "./resolveRepoUnsetTarget";
import { unsetDbBackedConfigKey } from "./unsetDbBackedConfigKey";
import { unsetFileConfigKey } from "./unsetFileConfigKey";
import { scopeOptionsError } from "./scopeOptionsError";

type ConfigUnsetOptions = {
	global?: boolean;
	repo?: boolean | string;
	user?: boolean;
};

export async function configUnset(
	key: string | undefined,
	options: ConfigUnsetOptions = {},
): Promise<void> {
	const scopeError = scopeOptionsError(options, "removes from");
	if (scopeError) exitWithConfigErrors([scopeError]);

	const resolved = resolveRepoUnsetTarget(key, options.repo);
	if (resolved.key === undefined) {
		console.error(chalk.red("Missing required argument 'key'"));
		process.exit(1);
		return;
	}

	if (isDbBackedConfigKey(resolved.key))
		return unsetDbBackedConfigKey(resolved.key, resolved.useRepo);
	await unsetFileConfigKey({
		key: resolved.key,
		useRepo: resolved.useRepo,
		repoName: resolved.repoName,
		global: options.global ?? false,
		user: options.user ?? false,
	});
}
