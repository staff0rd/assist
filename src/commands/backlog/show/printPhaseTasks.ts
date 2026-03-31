import chalk from "chalk";
import type { PlanPhase } from "../types";

export function printPhaseTasks(phase: PlanPhase): void {
	for (const task of phase.tasks) {
		console.log(`      - ${task.task}`);
		if (task.verify) {
			console.log(`        ${chalk.dim(`verify: ${task.verify}`)}`);
		}
	}

	if (phase.manualChecks && phase.manualChecks.length > 0) {
		console.log(`      ${chalk.dim("Manual checks:")}`);
		for (const check of phase.manualChecks) {
			console.log(`        ${chalk.dim(`- ${check}`)}`);
		}
	}
}
