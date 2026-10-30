import chalk from "chalk";
import { formatConfigLeafChange } from "./formatConfigLeafChange";
import type { UserConfigImportPlan } from "./planUserConfigImport";

export function printUserConfigImportPlan(plan: UserConfigImportPlan): void {
	console.log(chalk.bold("~/.assist.yml → user (db)"));
	for (const key of plan.missing)
		console.log(chalk.dim(`  ${key}: not in ~/.assist.yml`));
	if (plan.imported.length > 0 && plan.changes.length === 0)
		console.log(
			chalk.dim(`  ${plan.imported.join(", ")}: already in user (db)`),
		);
	for (const change of plan.changes)
		console.log(formatConfigLeafChange(change));
}
