import chalk from "chalk";
import { executePlan } from "./executePlan";
import type { RestructurePlan } from "./types";

export function applyPlan(plan: RestructurePlan): void {
	if (plan.errors.length > 0) {
		console.log(chalk.red("\nResolve the errors above before applying."));
		process.exit(1);
	}
	console.log(chalk.bold("\nApplying changes..."));
	executePlan(plan);
	console.log(chalk.green("\nRestructuring complete"));
}
