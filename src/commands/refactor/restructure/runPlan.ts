import chalk from "chalk";
import { applyCommand } from "./applyCommand";
import { applyPlan } from "./applyPlan";
import { displayDeepChains } from "./displayDeepChains";
import { displayPlan } from "./displayPlan";
import type { DeepChain } from "./findDeepChains";
import type { RestructurePlan } from "./types";

export function runPlan(
	plan: RestructurePlan,
	chains: DeepChain[],
	maxDepth: number,
	apply: boolean,
): void {
	displayPlan(plan);
	displayDeepChains(chains, maxDepth, applyCommand(plan.scopeRoot));
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
