import chalk from "chalk";
import { displayDeepChains } from "./displayDeepChains";
import { displayDrift } from "./displayDrift";
import type { DeepChain } from "./findDeepChains";
import type { RestructurePlan } from "./types";

export function checkPlan(
	plan: RestructurePlan,
	chains: DeepChain[],
	maxDepth: number,
): void {
	displayDrift(plan);
	displayDeepChains(chains, maxDepth);
	if (plan.moves.length > 0 || plan.errors.length > 0 || chains.length > 0)
		process.exit(1);
	console.log(chalk.green("Layout matches the restructure plan"));
}
