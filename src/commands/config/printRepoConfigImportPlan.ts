import chalk from "chalk";
import { formatConfigLeafChange } from "./formatConfigLeafChange";
import type { RepoConfigImportPlan } from "./planRepoConfigImport";

export function printRepoConfigImportPlan(plans: RepoConfigImportPlan[]): void {
	for (const plan of plans) {
		const target =
			plan.dbKey === plan.ymlKey ? "" : chalk.dim(` → ${plan.dbKey}`);
		console.log(chalk.bold(`repos.${plan.ymlKey}${target}`));
		if (plan.changes.length === 0)
			console.log(chalk.dim("  already in the shared db"));
		for (const change of plan.changes)
			console.log(formatConfigLeafChange(change));
	}
}
