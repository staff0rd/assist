import chalk from "chalk";
import { applyConfigSet, type ConfigWritableValue } from "./applyConfigSet";
import { applySharedRepoConfigSet } from "./applySharedRepoConfigSet";
import { applyUserConfigSet } from "./applyUserConfigSet";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";

type FileConfigTarget = {
	key: string;
	useRepo: boolean;
	repoName: string | undefined;
	global: boolean;
	user: boolean;
};

export async function setFileConfigKey(
	{ key, useRepo, repoName, global, user }: FileConfigTarget,
	coerced: ConfigWritableValue,
): Promise<void> {
	const target = useRepo
		? `repo: ${await applyRepoOrExit(key, coerced, repoName)}`
		: user
			? await applyUserOrExit(key, coerced)
			: applyOrExit(key, coerced, global);
	const shown = JSON.stringify(maskConfigKeySecrets(key, coerced));
	console.log(chalk.green(`Set ${key} = ${shown} (${target})`));
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

async function applyUserOrExit(
	key: string,
	coerced: ConfigWritableValue,
): Promise<string> {
	const result = await applyUserConfigSet(key, coerced);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return "user (db)";
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
