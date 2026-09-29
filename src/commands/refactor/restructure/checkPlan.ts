import path from "node:path";
import chalk from "chalk";
import { displayDeepChains } from "./displayDeepChains";
import { displayDrift } from "./displayDrift";
import type { DeepChain } from "./findDeepChains";
import type { RestructurePlan } from "./types";

function applyCommand(plan: RestructurePlan): string {
	const root = path.relative(process.cwd(), plan.scopeRoot) || ".";
	return `assist refactor restructure ${root} --apply`;
}

export function checkPlan(
	plan: RestructurePlan,
	chains: DeepChain[],
	maxDepth: number,
): void {
	displayDrift(plan);
	displayDeepChains(chains, maxDepth);
	if (chains.length > 0) {
		console.log(
			chalk.yellow(
				`\nOnce the plan is within the limit, run \`${applyCommand(plan)}\` to move the files and rewrite their imports.`,
			),
		);
		process.exit(1);
	}
	if (plan.errors.length > 0) process.exit(1);
	if (plan.moves.length > 0) {
		console.log(
			chalk.yellow(
				`\nRun \`${applyCommand(plan)}\` to move the files and rewrite their imports.`,
			),
		);
		process.exit(1);
	}
	console.log(chalk.green("Layout matches the restructure plan"));
}
