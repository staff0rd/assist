import { existsSync } from "node:fs";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import { holdsNoCheckout } from "./holdsNoCheckout";
import type { Leftover } from "./Leftover";
import { type LeftoverContents, leftoverContents } from "./leftoverContents";
import {
	clearLeftover,
	markLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";
import type { OrphanedWorktree } from "./resurfaceOrphanedWorktree";
import { underTempRoot } from "./underTempRoot";

export async function recheckReapedWorktrees(
	accounted: Set<string>,
): Promise<Leftover[]> {
	const leftovers: Leftover[] = [];
	for (const record of readReapedWorktreeRegistry()) {
		if (accounted.has(record.path) || underTempRoot(record.path)) continue;
		if (record.leftover) {
			if (existsSync(record.path))
				leftovers.push({ path: record.path, reason: record.leftover });
			else clearLeftover(record.path);
			continue;
		}
		if (!holdsNoCheckout(record.path)) continue;
		const reason = await clearReappearedTree(record);
		if (!reason) continue;
		markLeftover(record.path, reason);
		leftovers.push({ path: record.path, reason });
	}
	return leftovers;
}

async function clearReappearedTree(
	record: OrphanedWorktree,
): Promise<string | null> {
	const contents = leftoverContents(record.path);
	if (contents.holdsFiles) return reviewFirst(record.path, contents);
	const removal = await deleteTreeDirectly(
		record.clone,
		record.path,
		"it reappeared after its worktree was reaped, holding only empty directories (e.g. recreated by dockerd as a bind-mount source)",
	);
	return removal.removed ? null : removal.reason;
}

function reviewFirst(path: string, contents: LeftoverContents): string {
	const command = `${contents.foreignOwned ? "sudo " : ""}rm -rf ${path}`;
	return `it reappeared after its worktree was reaped and holds files assist will not delete unreviewed; check them, then remove it with \`${command}\``;
}
