import chalk from "chalk";
import { displayDrift } from "./displayDrift";
import type { RestructurePlan } from "./types";

export function checkPlan(plan: RestructurePlan): void {
	displayDrift(plan);
	if (plan.moves.length > 0 || plan.errors.length > 0) process.exit(1);
	console.log(chalk.green("Layout matches the restructure plan"));
}
