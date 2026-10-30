import chalk from "chalk";
import { applyConfigUnset } from "./applyConfigUnset";
import { applySharedRepoConfigUnset } from "./applySharedRepoConfigUnset";
import { applyUserConfigUnset } from "./applyUserConfigUnset";
import { configScopeNames } from "./configScopeNames";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

type FileConfigTarget = {
	key: string;
	useRepo: boolean;
	repoName: string | undefined;
	node: boolean;
	user: boolean;
};

type UnsetTarget =
	| { target: "global" | "project" | "user" }
	| { target: "repo"; label: string };

export async function unsetFileConfigKey({
	key,
	useRepo,
	repoName,
	node,
	user,
}: FileConfigTarget): Promise<void> {
	const result = useRepo
		? await applySharedRepoConfigUnset(key, repoName)
		: user
			? await applyUserConfigUnset(key)
			: applyConfigUnset(key, node);
	if (!result.ok) exitWithConfigErrors(result.errors);
	if (!result.removed) {
		console.log(chalk.yellow(`${key} is not set in ${targetLabel(result)}`));
		return;
	}
	console.log(chalk.green(`Unset ${key} (${targetLabel(result)})`));
}

function targetLabel(result: UnsetTarget): string {
	if (result.target === "repo")
		return `${configScopeNames.repo}: ${result.label}`;
	return configScopeNames[result.target];
}
