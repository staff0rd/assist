import path from "node:path";
import chalk from "chalk";
import type { RestructurePlan } from "./types";

const shownMoves = 20;

export function displayDrift(plan: RestructurePlan, listMoves: boolean): void {
	const rel = (file: string) => path.relative(process.cwd(), file);
	if (plan.moves.length > 0) {
		console.log(
			chalk.red(
				`${plan.moves.length} file(s) drift from the plan${listMoves ? ":" : "."}`,
			),
		);
		if (listMoves) {
			for (const move of plan.moves.slice(0, shownMoves))
				console.log(`  ${rel(move.from)} → ${rel(move.to)}`);
			if (plan.moves.length > shownMoves)
				console.log(chalk.dim(`  …and ${plan.moves.length - shownMoves} more`));
		}
	}
	for (const error of plan.errors) console.log(chalk.red(error));
}
