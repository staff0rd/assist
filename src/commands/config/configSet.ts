import chalk from "chalk";
import { coerceCliConfigValue } from "./coerceCliConfigValue";
import { isDbBackedConfigKey } from "./dbBackedConfigKeys";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { resolveRepoTarget } from "./resolveRepoTarget";
import { setDbBackedConfigKey } from "./setDbBackedConfigKey";
import { setFileConfigKey } from "./setFileConfigKey";
import { type ScopeOptions, scopeOptionsError } from "./scopeOptionsError";

export async function configSet(
	key: string,
	value: string | undefined,
	options: ScopeOptions = {},
): Promise<void> {
	const scopeError = scopeOptionsError(options);
	if (scopeError) exitWithConfigErrors([scopeError]);

	const resolved = resolveRepoTarget(key, value, options.repo);
	if (resolved.value === undefined) {
		console.error(chalk.red(`Missing required argument for '${resolved.key}'`));
		process.exit(1);
	}

	const coercion = coerceCliConfigValue(resolved.key, resolved.value);
	if (!coercion.ok) exitWithConfigErrors([coercion.error]);
	if (isDbBackedConfigKey(resolved.key))
		return setDbBackedConfigKey(resolved.key, coercion.value, resolved.useRepo);
	await setFileConfigKey(
		{
			...resolved,
			node: options.node ?? false,
			user: options.user ?? false,
		},
		coercion.value,
	);
}
