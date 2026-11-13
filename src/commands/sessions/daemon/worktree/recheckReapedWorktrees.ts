import { daemonLog } from "../daemonLog";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import { holdsNoCheckout } from "./holdsNoCheckout";
import {
	clearLeftover,
	markLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";
import { removeBindMountContainers } from "./removeBindMountContainers";
import { underTempRoot } from "./underTempRoot";

/** Deletes reaped worktree paths that reappeared with no .git (e.g. recreated
 * by dockerd as bind-mount sources), whatever they hold; a removal waiting on
 * Docker is recorded on the registry record and retried on the next restart. */
export async function recheckReapedWorktrees(
	accounted: Set<string>,
): Promise<void> {
	for (const record of readReapedWorktreeRegistry()) {
		if (accounted.has(record.path)) continue;
		if (underTempRoot(record.path) || !holdsNoCheckout(record.path)) {
			if (record.leftover) clearLeftover(record.path);
			continue;
		}
		daemonLog(
			`worktree ${record.path} reappeared after reaping with no .git; removing it`,
		);
		await removeBindMountContainers(record.path);
		const removal = await deleteTreeDirectly(
			record.clone,
			record.path,
			"it reappeared after its worktree was reaped, with no .git (e.g. recreated by dockerd as a bind-mount source)",
		);
		if (removal.removed) {
			if (record.leftover) clearLeftover(record.path);
			continue;
		}
		markLeftover(record.path, removal.deferred ? removal.reason : undefined);
		daemonLog(
			`worktree ${record.path} reappeared and could not be removed${removal.deferred ? " yet (waiting on Docker)" : ""}; retried on the next daemon restart: ${removal.reason}`,
		);
	}
}
