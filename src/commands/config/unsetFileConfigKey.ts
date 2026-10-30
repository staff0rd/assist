import chalk from "chalk";
import { applyConfigUnset } from "./applyConfigUnset";
import { applySharedRepoConfigUnset } from "./applySharedRepoConfigUnset";
import { applyUserConfigUnset } from "./applyUserConfigUnset";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

type FileConfigTarget = {
	key: string;
	useRepo: boolean;
	repoName: string | undefined;
	global: boolean;
	user: boolean;
};

type UnsetTarget =
	| { target: "global" | "project" | "user" }
	| { target: "repo"; label: string };

export async function unsetFileConfigKey({
	key,
	useRepo,
	repoName,
	global,
	user,
}: FileConfigTarget): Promise<void> {
	const result = useRepo
		? await applySharedRepoConfigUnset(key, repoName)
		: user
			? await applyUserConfigUnset(key)
			: applyConfigUnset(key, global);
	if (!result.ok) exitWithConfigErrors(result.errors);
	if (!result.removed) {
		console.log(chalk.yellow(`${key} is not set in ${whereLabel(result)}`));
		return;
	}
	console.log(chalk.green(`Unset ${key} (${targetLabel(result)})`));
}

function whereLabel(result: UnsetTarget): string {
	if (result.target === "repo") return `repos.${result.label}`;
	if (result.target === "user") return "user (db)";
	return `the ${result.target} config`;
}

function targetLabel(result: UnsetTarget): string {
	if (result.target === "repo") return `repo: ${result.label}`;
	if (result.target === "user") return "user (db)";
	return result.target;
}
