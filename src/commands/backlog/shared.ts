import chalk from "chalk";
import type { Db } from "../../shared/db/Db";
import { ensureMigrated } from "../../shared/db/ensureMigrated";
import { getDb } from "../../shared/db/getDb";
import { getProjectRoot } from "../../shared/loadConfig";
import { deleteItem } from "./deleteItem";
import { findBacklogUp } from "./findBacklogUp";
import { getCurrentOrigin } from "./getCurrentOrigin";
import { loadAllItems } from "./loadAllItems";
import { loadItem } from "./loadItem";
import { saveAllItems } from "./saveAllItems";
import { searchItemIds } from "./searchItemIds";
import type { BacklogFile, BacklogItem, BacklogStatus } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";
import { updateStatus } from "./updateStatus";

let _backlogDir: string | undefined;

export function setBacklogDir(dir: string | undefined): void {
	_backlogDir = dir;
}

function getBacklogDir(): string {
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
export async function getReady(): Promise<{ orm: Db }> {
	const orm = await getDb();
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

/**
 * Bulk-reconcile the set of items belonging to `origin`. Retained for
 * whole-backlog tooling (import/restore); per-item commands use targeted writes.
 *
 * @public
 */
export async function saveBacklog(items: BacklogFile): Promise<void> {
	const { orm } = await getReady();
	await saveAllItems(orm, items, getOrigin());
}

/**
 * Load a single item by id with one targeted read, returning it alongside the
 * resolved orm so callers can follow up with targeted writes. Prints a not-found
 * message and returns `undefined` when no item with that id exists.
 */
export async function findOneItem(
	id: string,
): Promise<{ orm: Db; item: BacklogItem } | undefined> {
	const numId = Number.parseInt(id, 10);
	const { orm } = await getReady();
	const item = Number.isNaN(numId) ? undefined : await loadItem(orm, numId);
	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return undefined;
	}
	return { orm, item };
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
