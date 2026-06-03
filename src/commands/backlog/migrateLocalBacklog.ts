import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { BacklogOrm } from "./BacklogOrm";
import { backupLocalBacklogFiles } from "./backupLocalBacklogFiles";
import { gitPullBacklog } from "./gitPullBacklog";
import { importItemsRemapped } from "./importItemsRemapped";
import { loadAllItems } from "./loadAllItems";
import { parseBacklogJsonl } from "./parseBacklogJsonl";
import type { BacklogItem } from "./types";

function jsonlPath(dir: string): string {
	return join(dir, ".assist", "backlog.jsonl");
}

/** Verify the import landed in the (previously empty) origin before touching files. */
async function verifyImport(
	orm: BacklogOrm,
	origin: string,
	items: BacklogItem[],
	imported: number,
): Promise<void> {
	const reloaded = await loadAllItems(orm, origin);
	if (reloaded.length !== imported) {
		throw new Error(
			`backlog migrate: expected ${imported} item(s) for ${origin} after import but found ${reloaded.length}.`,
		);
	}
	if (items.length > 0 && !reloaded.some((i) => i.name === items[0].name)) {
		throw new Error(
			`backlog migrate: spot-check failed; "${items[0].name}" not found after import.`,
		);
	}
}

/**
 * One-time bootstrap migration of a repository's local backlog
 * (`.assist/backlog.jsonl`) into the global Postgres store. Importing is only
 * attempted when the origin has NO items in Postgres yet — if items already exist
 * (a prior run, another clone, or a pre-seeded database), re-importing would
 * create duplicates, so the local file is archived without importing. When the
 * origin is empty: pull the latest committed file, import every item under
 * `origin` with fresh global ids (rewriting link targets), and verify. Either way
 * the local `.jsonl`/`.db` are renamed to `*.bak` so a local copy is retained and
 * the migration never re-runs. No-op when no local jsonl is present.
 */
export async function migrateLocalBacklog(
	orm: BacklogOrm,
	dir: string,
	origin: string,
): Promise<void> {
	if (!existsSync(jsonlPath(dir))) return;

	const existing = (await loadAllItems(orm, origin)).length;
	if (existing > 0) {
		const moved = backupLocalBacklogFiles(dir);
		console.error(
			chalk.yellow(
				`backlog migrate: Postgres already has ${existing} item(s) for ${origin}; skipped import to avoid duplicates and archived the local file (${moved.join(", ")}).`,
			),
		);
		return;
	}

	gitPullBacklog(dir);

	const items = parseBacklogJsonl(jsonlPath(dir));
	const imported = await importItemsRemapped(orm, items, origin);
	await verifyImport(orm, origin, items, imported);

	const moved = backupLocalBacklogFiles(dir);
	console.error(
		chalk.green(
			`backlog migrate: imported ${imported} item(s) into Postgres (${moved.join(", ")}).`,
		),
	);
}
