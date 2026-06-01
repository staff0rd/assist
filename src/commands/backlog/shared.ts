import chalk from "chalk";
import { getProjectRoot } from "../../shared/loadConfig";
import { deleteItem } from "./deleteItem";
import { findBacklogUp } from "./findBacklogUp";
import { getBacklogDb } from "./getBacklogDb";
import { getCurrentOrigin } from "./getCurrentOrigin";
import { loadAllItems } from "./loadAllItems";
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
	return _backlogDir ?? findBacklogUp(process.cwd()) ?? getProjectRoot();
}

/** The normalized git origin key for the repository the command is running in. */
export function getOrigin(): string {
	return getCurrentOrigin(getBacklogDir());
}

export async function loadBacklog(allRepos = false): Promise<BacklogFile> {
	const db = await getBacklogDb();
	return loadAllItems(db, allRepos ? undefined : getOrigin());
}

export async function searchBacklog(query: string): Promise<BacklogFile> {
	const db = await getBacklogDb();
	const origin = getOrigin();
	const ids = await searchItemIds(db, query, origin);
	const allItems = await loadAllItems(db, origin);
	return allItems.filter((item) => ids.includes(item.id));
}

export async function saveBacklog(items: BacklogFile): Promise<void> {
	const db = await getBacklogDb();
	await saveAllItems(db, items, getOrigin());
}

function findItem(items: BacklogFile, id: number) {
	return items.find((item) => item.id === id);
}

export async function loadAndFindItem(id: string) {
	const items = await loadBacklog();
	const item = findItem(items, Number.parseInt(id, 10));
	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return undefined;
	}
	return { items, item };
}

export async function setStatus(
	id: string,
	status: BacklogStatus,
): Promise<string | undefined> {
	const result = await loadAndFindItem(id);
	if (!result) return undefined;
	const db = await getBacklogDb();
	await updateStatus(db, result.item.id, status);
	return result.item.name;
}

export async function setCurrentPhase(
	id: string,
	phase: number,
): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) return;
	const db = await getBacklogDb();
	await updateCurrentPhase(db, result.item.id, phase);
}

export async function removeItem(id: string): Promise<string | undefined> {
	const result = await loadAndFindItem(id);
	if (!result) return undefined;
	const db = await getBacklogDb();
	await deleteItem(db, result.item.id);
	return result.item.name;
}
