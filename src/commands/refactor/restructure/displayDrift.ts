import path from "node:path";
import chalk from "chalk";
import type { RestructurePlan } from "./types";

export function displayDrift(plan: RestructurePlan): void {
	const rel = (file: string) => path.relative(process.cwd(), file);
	if (plan.moves.length > 0) {
		console.log(chalk.red(`${plan.moves.length} file(s) drift from the plan:`));
		for (const move of plan.moves)
			console.log(`  ${rel(move.from)} → ${rel(move.to)}`);
	}
	for (const error of plan.errors) console.log(chalk.red(error));
}
