import chalk from "chalk";
import { applyConfigSet, type ConfigWritableValue } from "./applyConfigSet";
import { applySharedRepoConfigSet } from "./applySharedRepoConfigSet";
import { applyUserConfigSet } from "./applyUserConfigSet";
import { configScopeNames } from "./configScopeNames";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";

type FileConfigTarget = {
	key: string;
	useRepo: boolean;
	repoName: string | undefined;
	node: boolean;
	user: boolean;
};

export async function setFileConfigKey(
	{ key, useRepo, repoName, node, user }: FileConfigTarget,
	coerced: ConfigWritableValue,
): Promise<void> {
	const target = useRepo
		? `${configScopeNames.repo}: ${await applyRepoOrExit(key, coerced, repoName)}`
		: user
			? await applyUserOrExit(key, coerced)
			: applyOrExit(key, coerced, node);
	const shown = JSON.stringify(maskConfigKeySecrets(key, coerced));
	console.log(chalk.green(`Set ${key} = ${shown} (${target})`));
}

function applyOrExit(
	key: string,
	coerced: ConfigWritableValue,
	node: boolean,
): string {
	const result = applyConfigSet(key, coerced, node);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return configScopeNames[result.target];
}

async function applyUserOrExit(
	key: string,
	coerced: ConfigWritableValue,
): Promise<string> {
	const result = await applyUserConfigSet(key, coerced);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return configScopeNames.user;
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
