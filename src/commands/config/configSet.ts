import chalk from "chalk";
import { applyConfigSet, type ConfigWritableValue } from "./applyConfigSet";
import { applySharedRepoConfigSet } from "./applySharedRepoConfigSet";
import { coerceCliConfigValue } from "./coerceCliConfigValue";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";
import { resolveRepoTarget } from "./resolveRepoTarget";

type ConfigSetOptions = {
	global?: boolean;
	repo?: boolean | string;
};

export async function configSet(
	key: string,
	value: string | undefined,
	options: ConfigSetOptions = {},
): Promise<void> {
	if (options.repo !== undefined && !options.global) {
		console.error(
			chalk.red("--repo writes to the global config; add -g (e.g. -g --repo)"),
		);
		process.exit(1);
	}

	const resolved = resolveRepoTarget(key, value, options.repo);
	if (resolved.value === undefined) {
		console.error(chalk.red(`Missing required argument for '${resolved.key}'`));
		process.exit(1);
	}

	const coercion = coerceCliConfigValue(resolved.key, resolved.value);
	if (!coercion.ok) exitWithConfigErrors([coercion.error]);
	const coerced = coercion.value;
	const target = resolved.useRepo
		? `repo: ${await applyRepoOrExit(resolved.key, coerced, resolved.repoName)}`
		: applyOrExit(resolved.key, coerced, options.global ?? false);
	const shown = JSON.stringify(maskConfigKeySecrets(resolved.key, coerced));
	console.log(chalk.green(`Set ${resolved.key} = ${shown} (${target})`));
}

function applyOrExit(
	key: string,
	coerced: ConfigWritableValue,
	global: boolean,
): string {
	const result = applyConfigSet(key, coerced, global);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return result.target;
}

async function applyRepoOrExit(
	key: string,
	coerced: ConfigWritableValue,
	repoName: string | undefined,
): Promise<string> {
	const result = await applySharedRepoConfigSet(key, coerced, repoName);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return result.label;
}
