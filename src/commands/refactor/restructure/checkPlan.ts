import chalk from "chalk";
import { applyCommand } from "./applyCommand";
import { displayDeepChains } from "./displayDeepChains";
import { displayDrift } from "./displayDrift";
import type { DeepChain } from "./findDeepChains";
import type { RestructurePlan } from "./types";

export function checkPlan(
	plan: RestructurePlan,
	chains: DeepChain[],
	maxDepth: number,
): void {
	const apply = applyCommand(plan.scopeRoot);
	displayDrift(plan, chains.length === 0);
	displayDeepChains(chains, maxDepth, apply);
	if (chains.length > 0 || plan.errors.length > 0) process.exit(1);
	if (plan.moves.length > 0) {
		console.log(
			chalk.yellow(
				`\nRun \`${apply}\` to move the files and rewrite their imports.`,
			),
		);
		process.exit(1);
	}
	console.log(chalk.green("Layout matches the restructure plan"));
}
