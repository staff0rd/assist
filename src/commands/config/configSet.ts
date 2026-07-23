import chalk from "chalk";
import { applyConfigSet } from "./applyConfigSet";
import { applyRepoConfigSet } from "./applyRepoConfigSet";
import { resolveRepoTarget } from "./resolveRepoTarget";

type ConfigSetOptions = {
	global?: boolean;
	repo?: boolean | string;
};

export function configSet(
	key: string,
	value: string | undefined,
	options: ConfigSetOptions = {},
): void {
	if (options.repo !== undefined && options.global) {
		console.error(chalk.red("Use either --repo or --global, not both"));
		process.exit(1);
	}

	const resolved = resolveRepoTarget(key, value, options.repo);
	if (resolved.value === undefined) {
		console.error(chalk.red(`Missing required argument for '${resolved.key}'`));
		process.exit(1);
	}

	const coerced = coerceValue(resolved.value);
	const target = resolved.useRepo
		? `repo: ${applyRepoConfigSet(resolved.key, coerced, resolved.repoName)}`
		: applyConfigSet(resolved.key, coerced, options.global ?? false);
	console.log(
		chalk.green(`Set ${resolved.key} = ${JSON.stringify(coerced)} (${target})`),
	);
}

function coerceValue(value: string): string | boolean {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
}
