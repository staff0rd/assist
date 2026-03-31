import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
	type BacklogFile,
	type BacklogStatus,
	backlogFileSchema,
} from "./types";

let _backlogDir: string | undefined;

export function setBacklogDir(dir: string | undefined): void {
	_backlogDir = dir;
}

export function getBacklogDir(): string {
	return _backlogDir ?? process.cwd();
}

export function getBacklogPath(): string {
	return join(getBacklogDir(), "assist.backlog.yml");
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

export function loadAndFindItem(id: string) {
	if (!existsSync(getBacklogPath())) {
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
	return { items, item };
}

export function setStatus(
	id: string,
	status: BacklogStatus,
): string | undefined {
	const result = loadAndFindItem(id);
	if (!result) return undefined;
	result.item.status = status;
	saveBacklog(result.items);
	return result.item.name;
}

export function setCurrentPhase(id: string, phase: number): void {
	const result = loadAndFindItem(id);
	if (!result) return;
	result.item.currentPhase = phase;
	saveBacklog(result.items);
}

export function removeItem(id: string): string | undefined {
	const result = loadAndFindItem(id);
	if (!result) return undefined;
	saveBacklog(result.items.filter((i) => i.id !== result.item.id));
	return result.item.name;
}

export function getNextId(items: BacklogFile): number {
	if (items.length === 0) return 1;
	return Math.max(...items.map((item) => item.id)) + 1;
}
