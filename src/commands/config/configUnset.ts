import chalk from "chalk";
import { applyConfigUnset } from "./applyConfigUnset";
import { applySharedRepoConfigUnset } from "./applySharedRepoConfigUnset";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { resolveRepoUnsetTarget } from "./resolveRepoUnsetTarget";

type ConfigUnsetOptions = {
	global?: boolean;
	repo?: boolean | string;
};

type UnsetTarget =
	| { target: "global" | "project" }
	| { target: "repo"; label: string };

export async function configUnset(
	key: string | undefined,
	options: ConfigUnsetOptions = {},
): Promise<void> {
	if (options.repo !== undefined && !options.global) {
		console.error(
			chalk.red(
				"--repo removes from the global config; add -g (e.g. -g --repo)",
			),
		);
		process.exit(1);
	}

	const resolved = resolveRepoUnsetTarget(key, options.repo);
	if (resolved.key === undefined) {
		console.error(chalk.red("Missing required argument 'key'"));
		process.exit(1);
		return;
	}

	const result = resolved.useRepo
		? await applySharedRepoConfigUnset(resolved.key, resolved.repoName)
		: applyConfigUnset(resolved.key, options.global ?? false);
	if (!result.ok) exitWithConfigErrors(result.errors);
	if (!result.removed) {
		console.log(
			chalk.yellow(`${resolved.key} is not set in ${whereLabel(result)}`),
		);
		return;
	}
	console.log(chalk.green(`Unset ${resolved.key} (${targetLabel(result)})`));
}

function whereLabel(result: UnsetTarget): string {
	return result.target === "repo"
		? `repos.${result.label}`
		: `the ${result.target} config`;
}

function targetLabel(result: UnsetTarget): string {
	return result.target === "repo" ? `repo: ${result.label}` : result.target;
}
