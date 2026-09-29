import chalk from "chalk";
import { applyCommand } from "./applyCommand";
import type { LayoutLimits } from "./checkLayoutLimits";
import { displayDrift } from "./displayDrift";
import {
	displayLayoutLimits,
	exceedsLayoutLimits,
} from "./displayLayoutLimits";
import type { RestructurePlan } from "./types";

export function checkPlan(plan: RestructurePlan, limits: LayoutLimits): void {
	const apply = applyCommand(plan.scopeRoot);
	const exceeds = exceedsLayoutLimits(limits);
	displayDrift(plan, !exceeds);
	displayLayoutLimits(limits, apply);
	if (exceeds || plan.errors.length > 0) process.exit(1);
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
