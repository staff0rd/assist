import chalk from "chalk";
import { loadAndFindItem } from "../shared";
import type { BacklogItem, PlanPhase } from "../types";

function printPlan(item: BacklogItem): void {
	if (!item.plan || item.plan.length === 0) return;

	console.log(chalk.bold("Plan"));
	for (const [i, phase] of item.plan.entries()) {
		const isCurrent = item.currentPhase === i;
		printPhase(phase, i, isCurrent);
	}
	console.log();
}

function printPhase(phase: PlanPhase, index: number, isCurrent: boolean): void {
	const marker = isCurrent ? chalk.green("▶ ") : "  ";
	const label = isCurrent
		? chalk.green.bold(`Phase ${index + 1}: ${phase.name}`)
		: `${chalk.bold(`Phase ${index + 1}:`)} ${phase.name}`;
	console.log(`${marker}${label}`);

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

export function show(id: string): void {
	const result = loadAndFindItem(id);
	if (!result) process.exit(1);

	const { item } = result;

	console.log(chalk.bold(`#${item.id} ${item.name}`));
	console.log(
		`${chalk.dim("Type:")} ${item.type}  ${chalk.dim("Status:")} ${item.status}`,
	);
	console.log();

	if (item.description) {
		console.log(chalk.bold("Description"));
		console.log(item.description);
		console.log();
	}

	if (item.acceptanceCriteria.length > 0) {
		console.log(chalk.bold("Acceptance Criteria"));
		for (const [i, ac] of item.acceptanceCriteria.entries()) {
			console.log(`  ${i + 1}. ${ac}`);
		}
		console.log();
	}

	printPlan(item);
}
