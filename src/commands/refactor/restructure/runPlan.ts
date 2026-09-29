import chalk from "chalk";
import { applyCommand } from "./applyCommand";
import { applyPlan } from "./applyPlan";
import type { LayoutLimits } from "./checkLayoutLimits";
import { displayLayoutLimits } from "./displayLayoutLimits";
import { displayPlan } from "./displayPlan";
import type { RestructurePlan } from "./types";

export function runPlan(
	plan: RestructurePlan,
	limits: LayoutLimits,
	apply: boolean,
): void {
	displayPlan(plan);
	displayLayoutLimits(limits, applyCommand(plan.scopeRoot));
	if (plan.moves.length === 0 && plan.errors.length === 0) {
		console.log(chalk.green("No restructuring needed"));
		return;
	}
	if (!apply) {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
		return;
	}
	applyPlan(plan);
}
