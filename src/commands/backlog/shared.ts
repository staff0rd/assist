import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { getProjectRoot } from "../../shared/loadConfig";
import { deleteItem } from "./deleteItem";
import { exportToJsonl } from "./exportToJsonl";
import { importFromJsonlIfNeeded } from "./importFromJsonlIfNeeded";
import { loadAllItems } from "./loadAllItems";
import { migrateYamlIfNeeded } from "./migrateYamlIfNeeded";
import { openDb } from "./openDb";
import { saveAllItems } from "./saveAllItems";
import { searchItemIds } from "./searchItemIds";
import type { BacklogFile, BacklogStatus } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";
import { updateStatus } from "./updateStatus";

let _backlogDir: string | undefined;

export function setBacklogDir(dir: string | undefined): void {
	_backlogDir = dir;
}

export function getBacklogDir(): string {
	return _backlogDir ?? getProjectRoot();
}

function getBacklogPath(): string {
	return join(getBacklogDir(), "assist.backlog.yml");
}

export function backlogExists(): boolean {
	const dir = getBacklogDir();
	return (
		existsSync(join(dir, ".assist", "backlog.db")) ||
		existsSync(join(dir, ".assist", "backlog.jsonl")) ||
		existsSync(join(dir, "assist.backlog.yml"))
	);
}

function getDb() {
	const dir = getBacklogDir();
	const db = openDb(dir);
	const migrated = migrateYamlIfNeeded(db, getBacklogPath());
	if (migrated) exportToJsonl(db, dir);
	return db;
}

export function loadBacklog(): BacklogFile {
	const db = getDb();
	importFromJsonlIfNeeded(db, getBacklogDir());
	return loadAllItems(db);
}

export function searchBacklog(query: string): BacklogFile {
	const db = getDb();
	importFromJsonlIfNeeded(db, getBacklogDir());
	const ids = searchItemIds(db, query);
	const allItems = loadAllItems(db);
	return allItems.filter((item) => ids.includes(item.id));
}

export function saveBacklog(items: BacklogFile): void {
	const db = getDb();
	saveAllItems(db, items);
	exportToJsonl(db, getBacklogDir());
}

function findItem(items: BacklogFile, id: number) {
	return items.find((item) => item.id === id);
}

export function loadAndFindItem(id: string) {
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
	const db = getDb();
	updateStatus(db, result.item.id, status);
	exportToJsonl(db, getBacklogDir());
	return result.item.name;
}

export function setCurrentPhase(id: string, phase: number): void {
	const result = loadAndFindItem(id);
	if (!result) return;
	const db = getDb();
	updateCurrentPhase(db, result.item.id, phase);
	exportToJsonl(db, getBacklogDir());
}

export function removeItem(id: string): string | undefined {
	const result = loadAndFindItem(id);
	if (!result) return undefined;
	const db = getDb();
	deleteItem(db, result.item.id);
	exportToJsonl(db, getBacklogDir());
	return result.item.name;
}
