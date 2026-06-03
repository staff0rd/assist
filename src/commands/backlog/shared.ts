import chalk from "chalk";
import { getProjectRoot } from "../../shared/loadConfig";
import type { BacklogOrm } from "./BacklogOrm";
import { deleteItem } from "./deleteItem";
import { ensureMigrated } from "./ensureMigrated";
import { findBacklogUp } from "./findBacklogUp";
import { getBacklogOrm } from "./getBacklogOrm";
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

/**
 * Resolve the backlog database, running the one-time local→Postgres migration for
 * the current repository on first use. Mutation commands call this directly to
 * obtain the Drizzle client for targeted writes without loading the whole backlog.
 */
export async function getReady(): Promise<{ orm: BacklogOrm }> {
	const orm = await getBacklogOrm();
	const dir = getBacklogDir();
	await ensureMigrated(orm, dir, getCurrentOrigin(dir));
	return { orm };
}

export async function loadBacklog(allRepos = false): Promise<BacklogFile> {
	const { orm } = await getReady();
	return loadAllItems(orm, allRepos ? undefined : getOrigin());
}

export async function searchBacklog(query: string): Promise<BacklogFile> {
	const { orm } = await getReady();
	const origin = getOrigin();
	const ids = await searchItemIds(orm, query, origin);
	const allItems = await loadAllItems(orm, origin);
	return allItems.filter((item) => ids.includes(item.id));
}

export async function saveBacklog(items: BacklogFile): Promise<void> {
	const { orm } = await getReady();
	await saveAllItems(orm, items, getOrigin());
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
	const { orm } = await getReady();
	const name = await updateStatus(orm, Number.parseInt(id, 10), status);
	if (name === undefined) console.log(chalk.red(`Item #${id} not found.`));
	return name;
}

export async function setCurrentPhase(
	id: string,
	phase: number,
): Promise<void> {
	const { orm } = await getReady();
	await updateCurrentPhase(orm, Number.parseInt(id, 10), phase);
}

export async function removeItem(id: string): Promise<string | undefined> {
	const { orm } = await getReady();
	const name = await deleteItem(orm, Number.parseInt(id, 10));
	if (name === undefined) console.log(chalk.red(`Item #${id} not found.`));
	return name;
}
