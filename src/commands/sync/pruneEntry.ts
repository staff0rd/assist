import type * as fs from "node:fs";
import * as path from "node:path";
import { rmSync } from "node:fs";
import type { SyncOwner } from "./createSyncFiles";

export type PruneResult = {
	orphans: string[];
	removed: string[];
	skipped: { name: string; reason: string }[];
	unmanaged: string[];
};

export type PruneShape = {
	nameOf: (entry: fs.Dirent) => string | undefined;
	ownedPaths?: (entryPath: string) => string[];
	blockedBy?: (entryPath: string) => string | undefined;
};

export function pruneEntry(
	entry: fs.Dirent,
	targetDir: string,
	keep: Set<string>,
	shape: PruneShape,
	options: { force: boolean; owner: SyncOwner },
	result: PruneResult,
): void {
	const name = shape.nameOf(entry);
	if (name !== undefined && keep.has(name)) return;

	const entryPath = path.join(targetDir, entry.name);
	const ownedPaths = shape.ownedPaths?.(entryPath) ?? [entryPath];
	if (name === undefined || !ownedPaths.some(options.owner.owns)) {
		result.unmanaged.push(entry.name);
		return;
	}

	result.orphans.push(entry.name);

	const reason = shape.blockedBy?.(entryPath);
	if (reason) {
		result.skipped.push({ name: entry.name, reason });
		return;
	}

	if (!options.force) return;
	rmSync(entryPath, { recursive: true });
	for (const owned of ownedPaths) options.owner.forget(owned);
	result.removed.push(entry.name);
}
