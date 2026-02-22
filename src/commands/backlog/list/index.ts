import { existsSync } from "node:fs";
import chalk from "chalk";
import { getBacklogPath, loadBacklog } from "../shared";
import type { BacklogFile, BacklogStatus, BacklogType } from "../types";

function statusIcon(status: BacklogStatus): string {
	switch (status) {
		case "todo":
			return chalk.dim("[ ]");
		case "in-progress":
			return chalk.yellow("[~]");
		case "done":
			return chalk.green("[x]");
	}
}

function typeLabel(type: BacklogType): string {
	switch (type) {
		case "bug":
			return chalk.magenta("Bug");
		case "story":
			return chalk.cyan("Story");
	}
}

function printVerboseDetails(item: BacklogFile[number]): void {
	if (item.description) {
		console.log(`  ${chalk.dim("Description:")} ${item.description}`);
	}
	if (item.acceptanceCriteria.length > 0) {
		console.log(`  ${chalk.dim("Acceptance criteria:")}`);
		for (const criterion of item.acceptanceCriteria) {
			console.log(`    - ${criterion}`);
		}
	}
	console.log();
}

export async function list(options: {
	status?: string;
	verbose?: boolean;
}): Promise<void> {
	const backlogPath = getBacklogPath();
	if (!existsSync(backlogPath)) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}
	let items = loadBacklog();
	if (options.status) {
		items = items.filter((item) => item.status === options.status);
	}
	if (items.length === 0) {
		console.log(chalk.dim("Backlog is empty."));
		return;
	}
	for (const item of items) {
		console.log(
			`${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(`#${item.id}`)} ${item.name}`,
		);
		if (options.verbose) {
			printVerboseDetails(item);
		}
	}
}
