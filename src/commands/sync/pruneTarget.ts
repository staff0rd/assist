import * as fs from "node:fs";
import type { SyncOwner } from "./createSyncFiles";
import { type PruneResult, type PruneShape, pruneEntry } from "./pruneEntry";

export type { PruneResult };

export type PruneOptions = {
	prune?: boolean;
	force?: boolean;
};

export function pruneTarget(
	targetDir: string,
	keepNames: Iterable<string>,
	shape: PruneShape,
	options: { force: boolean; owner: SyncOwner },
): PruneResult {
	const result: PruneResult = {
		orphans: [],
		removed: [],
		skipped: [],
		unmanaged: [],
	};

	if (!fs.existsSync(targetDir)) return result;

	const keep = new Set(keepNames);
	for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
		pruneEntry(entry, targetDir, keep, shape, options, result);
	}

	return result;
}
