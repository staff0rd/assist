import chalk from "chalk";
import { isDbBackedConfigKey } from "./dbBackedConfigKeys";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { resolveRepoUnsetTarget } from "./resolveRepoUnsetTarget";
import { unsetDbBackedConfigKey } from "./unsetDbBackedConfigKey";
import { unsetFileConfigKey } from "./unsetFileConfigKey";
import { type ScopeOptions, scopeOptionsError } from "./scopeOptionsError";

export async function configUnset(
	key: string | undefined,
	options: ScopeOptions = {},
): Promise<void> {
	const scopeError = scopeOptionsError(options);
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
		node: options.node ?? false,
		user: options.user ?? false,
	});
}
