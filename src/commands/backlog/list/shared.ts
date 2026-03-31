import chalk from "chalk";
import type { BacklogFile, BacklogStatus, BacklogType } from "../types";

export function statusIcon(status: BacklogStatus): string {
	switch (status) {
		case "todo":
			return chalk.dim("[ ]");
		case "in-progress":
			return chalk.yellow("[~]");
		case "done":
			return chalk.green("[x]");
	}
}

export function typeLabel(type: BacklogType): string {
	switch (type) {
		case "bug":
			return chalk.magenta("Bug");
		case "story":
			return chalk.cyan("Story");
	}
}

export function phaseLabel(item: BacklogFile[number]): string {
	if (!item.plan) return "";
	return chalk.dim(
		` (phase ${(item.currentPhase ?? 0) + 1}/${item.plan.length})`,
	);
}

export function dependencyLabel(item: BacklogFile[number]): string {
	const deps = (item.links ?? []).filter((l) => l.type === "depends-on");
	if (deps.length === 0) return "";
	return chalk.dim(` [${deps.length} dep${deps.length > 1 ? "s" : ""}]`);
}

export function printVerboseDetails(item: BacklogFile[number]): void {
	if (item.description) {
		console.log(`  ${chalk.dim("Description:")} ${item.description}`);
	}
	if (item.acceptanceCriteria.length > 0) {
		console.log(`  ${chalk.dim("Acceptance criteria:")}`);
		for (const [i, criterion] of item.acceptanceCriteria.entries()) {
			console.log(`    ${i + 1}. ${criterion}`);
		}
	}
	console.log();
}
