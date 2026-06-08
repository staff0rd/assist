import chalk from "chalk";
import type { BacklogFile, BacklogStatus, BacklogType } from "../types";

/** The minimal shape isBlocked needs from each dependency target. */
type StatusLookup = ReadonlyArray<{ id: number; status: BacklogStatus }>;

export function statusIcon(status: BacklogStatus): string {
	switch (status) {
		case "todo":
			return chalk.dim("[ ]");
		case "in-progress":
			return chalk.yellow("[~]");
		case "done":
			return chalk.green("[x]");
		case "wontdo":
			return chalk.dim("[-]");
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
	return chalk.dim(` (phase ${item.currentPhase ?? 1}/${item.plan.length})`);
}

export function isBlocked(
	item: BacklogFile[number],
	items: StatusLookup,
): boolean {
	const deps = (item.links ?? []).filter((l) => l.type === "depends-on");
	return deps.some((dep) => {
		const target = items.find((i) => i.id === dep.targetId);
		return target !== undefined && target.status !== "done";
	});
}

export function dependencyLabel(
	item: BacklogFile[number],
	items: BacklogFile,
): string {
	const deps = (item.links ?? []).filter((l) => l.type === "depends-on");
	if (deps.length === 0) return "";
	if (isBlocked(item, items)) return chalk.red(" [blocked]");
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
