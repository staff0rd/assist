import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
	type BacklogFile,
	type BacklogStatus,
	backlogFileSchema,
} from "./types";

export function getBacklogPath(): string {
	return join(process.cwd(), "assist.backlog.yml");
}

export function loadBacklog(): BacklogFile {
	const backlogPath = getBacklogPath();
	if (!existsSync(backlogPath)) {
		return [];
	}
	try {
		const content = readFileSync(backlogPath, "utf-8");
		const raw = parseYaml(content) || [];
		return backlogFileSchema.parse(raw);
	} catch {
		return [];
	}
}

export function saveBacklog(items: BacklogFile): void {
	const backlogPath = getBacklogPath();
	writeFileSync(backlogPath, stringifyYaml(items, { lineWidth: 0 }));
}

function findItem(items: BacklogFile, id: number) {
	return items.find((item) => item.id === id);
}

export function setStatus(
	id: string,
	status: BacklogStatus,
): string | undefined {
	const backlogPath = getBacklogPath();
	if (!existsSync(backlogPath)) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return undefined;
	}
	const items = loadBacklog();
	const item = findItem(items, Number.parseInt(id, 10));
	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return undefined;
	}
	item.status = status;
	saveBacklog(items);
	return item.name;
}

export function getNextId(items: BacklogFile): number {
	if (items.length === 0) return 1;
	return Math.max(...items.map((item) => item.id)) + 1;
}
