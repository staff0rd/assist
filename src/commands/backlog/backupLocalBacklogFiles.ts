import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const LOCAL_FILES = ["backlog.jsonl", "backlog.db"];

/**
 * Rename a repository's local backlog files to `*.bak` once their contents have
 * been migrated to Postgres. Renaming (rather than deleting) retains a local
 * copy and stops the one-time migration from re-running. Returns a human-readable
 * list of the renames performed.
 */
export function backupLocalBacklogFiles(dir: string): string[] {
	const moved: string[] = [];
	for (const name of LOCAL_FILES) {
		const path = join(dir, ".assist", name);
		if (existsSync(path)) {
			renameSync(path, `${path}.bak`);
			moved.push(`${name} → ${name}.bak`);
		}
	}
	return moved;
}
