import chalk from "chalk";
import { formatComment } from "../formatComment";
import { formatItemId } from "../formatItemId";
import { renderMarkdownTerminal } from "../../../shared/renderMarkdownTerminal";
import { findOneItem } from "../shared";
import type { BacklogItem } from "../types";
import { printActivity } from "./printActivity";
import { printLinks } from "./printLinks";
import { printPlan } from "./printPlan";
import { printSubtasks } from "./printSubtasks";

function printHeader(item: BacklogItem): void {
	console.log(chalk.bold(`${formatItemId(item.id)} ${item.name}`));
	console.log(
		`${chalk.dim("Type:")} ${item.type}  ${chalk.dim("Status:")} ${item.status}`,
	);
	if (item.jiraKey) {
		console.log(`${chalk.dim("Jira:")} ${item.jiraKey}`);
	}
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

function printComments(item: BacklogItem): void {
	const entries = item.comments ?? [];
	if (entries.length === 0) return;

	console.log(chalk.bold("Comments"));
	for (const entry of entries) {
		console.log(`  ${formatComment(entry)}`);
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
		console.log(renderMarkdownTerminal(item.description));
		console.log();
	}

	printAcceptanceCriteria(item.acceptanceCriteria);
	printSubtasks(item);
	await printLinks(orm, item);
	printPlan(item);
	printActivity(item);
	printComments(item);
}
