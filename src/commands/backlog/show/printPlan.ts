import chalk from "chalk";
import type { BacklogItem, PlanPhase } from "../types";
import { printPhaseTasks } from "./printPhaseTasks";

function phaseHeader(index: number, name: string, isCurrent: boolean): string {
	const phaseNumber = index + 1;
	const marker = isCurrent ? chalk.green("▶ ") : "  ";
	const label = isCurrent
		? chalk.green.bold(`Phase ${phaseNumber}: ${name}`)
		: `${chalk.bold(`Phase ${phaseNumber}:`)} ${name}`;
	return `${marker}${label}`;
}

function printPhase(phase: PlanPhase, index: number, isCurrent: boolean): void {
	console.log(phaseHeader(index, phase.name, isCurrent));
	printPhaseTasks(phase);
}

export function printPlan(item: BacklogItem): void {
	if (!item.plan || item.plan.length === 0) return;

	console.log(chalk.bold("Plan"));
	for (const [i, phase] of item.plan.entries()) {
		const isCurrent = item.currentPhase === i + 1;
		printPhase(phase, i, isCurrent);
	}
	console.log();
}
