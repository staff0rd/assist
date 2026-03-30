import chalk from "chalk";
import { formatComment } from "../formatComment";
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

function phaseHeader(index: number, name: string, isCurrent: boolean): string {
	const marker = isCurrent ? chalk.green("▶ ") : "  ";
	const label = isCurrent
		? chalk.green.bold(`Phase ${index + 1}: ${name}`)
		: `${chalk.bold(`Phase ${index + 1}:`)} ${name}`;
	return `${marker}${label}`;
}

function printPhaseTasks(phase: PlanPhase): void {
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

function printPhase(phase: PlanPhase, index: number, isCurrent: boolean): void {
	console.log(phaseHeader(index, phase.name, isCurrent));
	printPhaseTasks(phase);
}

function printHeader(item: BacklogItem): void {
	console.log(chalk.bold(`#${item.id} ${item.name}`));
	console.log(
		`${chalk.dim("Type:")} ${item.type}  ${chalk.dim("Status:")} ${item.status}`,
	);
	console.log();
}

function printAcceptanceCriteria(criteria: string[]): void {
	if (criteria.length === 0) return;
	console.log(chalk.bold("Acceptance Criteria"));
	for (const [i, ac] of criteria.entries()) {
		console.log(`  ${i + 1}. ${ac}`);
	}
	console.log();
}

export function show(id: string): void {
	const result = loadAndFindItem(id);
	if (!result) process.exit(1);

	const { item } = result;
	printHeader(item);

	if (item.description) {
		console.log(chalk.bold("Description"));
		console.log(item.description);
		console.log();
	}

	printAcceptanceCriteria(item.acceptanceCriteria);
	printPlan(item);
	printComments(item);
}

function printComments(item: BacklogItem): void {
	const entries = item.comments ?? [];
	if (entries.length === 0) return;

	console.log(chalk.bold("Comments"));
	for (const entry of entries) {
		console.log(`  ${formatComment(entry)}`);
	}
	console.log();
}
