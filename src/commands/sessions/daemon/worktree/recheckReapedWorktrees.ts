import { daemonLog } from "../daemonLog";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import { holdsNoCheckout } from "./holdsNoCheckout";
import { type LeftoverContents, leftoverContents } from "./leftoverContents";
import {
	markLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";
import type { OrphanedWorktree } from "./resurfaceOrphanedWorktree";
import { underTempRoot } from "./underTempRoot";

/** Delete reaped worktree paths that reappeared holding only empty dirs; record
 * any it cannot delete as a leftover on the registry record so later restarts
 * list it (listLeftovers) without retrying the removal. */
export async function recheckReapedWorktrees(
	accounted: Set<string>,
): Promise<void> {
	for (const record of readReapedWorktreeRegistry()) {
		if (record.leftover || accounted.has(record.path)) continue;
		if (underTempRoot(record.path) || !holdsNoCheckout(record.path)) continue;
		const reason = await clearReappearedTree(record);
		if (!reason) continue;
		markLeftover(record.path, reason);
		daemonLog(
			`worktree ${record.path} reappeared after reaping and is recorded as a leftover: ${reason}`,
		);
	}
}

async function clearReappearedTree(
	record: OrphanedWorktree,
): Promise<string | null> {
	const contents = leftoverContents(record.path);
	if (contents.holdsFiles) return reviewFirst(contents);
	const removal = await deleteTreeDirectly(
		record.clone,
		record.path,
		"it reappeared after its worktree was reaped, holding only empty directories (e.g. recreated by dockerd as a bind-mount source)",
	);
	return removal.removed ? null : removal.reason;
}

function reviewFirst(contents: LeftoverContents): string {
	return `it reappeared after its worktree was reaped and holds files${contents.foreignOwned ? " (some not owned by you)" : ""} that assist will not delete unreviewed; check them before removing it`;
}
