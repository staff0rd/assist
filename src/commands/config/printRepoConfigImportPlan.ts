import chalk from "chalk";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";
import type { RepoConfigImportPlan } from "./planRepoConfigImport";

export function printRepoConfigImportPlan(plans: RepoConfigImportPlan[]): void {
	for (const plan of plans) {
		const target =
			plan.dbKey === plan.ymlKey ? "" : chalk.dim(` → ${plan.dbKey}`);
		console.log(chalk.bold(`repos.${plan.ymlKey}${target}`));
		if (plan.changes.length === 0)
			console.log(chalk.dim("  already in the shared db"));
		for (const change of plan.changes) {
			const to = show(change.key, change.to);
			console.log(
				"from" in change
					? chalk.yellow(
							`  ~ ${change.key}: ${show(change.key, change.from)} → ${to}`,
						)
					: chalk.green(`  + ${change.key}: ${to}`),
			);
		}
	}
}

function show(key: string, value: unknown): string {
	return JSON.stringify(maskConfigKeySecrets(key, value));
}
