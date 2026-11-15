import chalk from "chalk";
import { differingDependsOn } from "../dependsOn/differingDependsOn";
import { formatDependsOn } from "../dependsOn/formatDependsOn";
import type { PlanPhase } from "../types";

export function printPhaseTasks(phase: PlanPhase, phaseNumber: number): void {
	const dependsOn = differingDependsOn(phase.dependsOn, phaseNumber);
	if (dependsOn)
		console.log(
			`      ${chalk.dim(`Depends on: ${formatDependsOn(dependsOn)}`)}`,
		);

	for (const task of phase.tasks) {
		console.log(`      - ${task.task}`);
	}

	if (phase.manualChecks && phase.manualChecks.length > 0) {
		console.log(`      ${chalk.dim("Manual checks:")}`);
		for (const check of phase.manualChecks) {
			console.log(`        ${chalk.dim(`- ${check}`)}`);
		}
	}
}
