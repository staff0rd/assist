import chalk from "chalk";
import { formatComment } from "../formatComment";
import { findOneItem } from "../shared";
import type { BacklogItem, PlanPhase } from "../types";
import { printLinks } from "./printLinks";
import { printPhaseTasks } from "./printPhaseTasks";

function printPlan(item: BacklogItem): void {
	if (!item.plan || item.plan.length === 0) return;

	console.log(chalk.bold("Plan"));
	for (const [i, phase] of item.plan.entries()) {
		const isCurrent = item.currentPhase === i + 1;
		printPhase(phase, i, isCurrent);
	}
	console.log();
}

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

export async function show(id: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	const { orm, item } = found;
	printHeader(item);

	if (item.description) {
		console.log(chalk.bold("Description"));
		console.log(item.description);
		console.log();
	}

	printAcceptanceCriteria(item.acceptanceCriteria);
	await printLinks(orm, item);
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
