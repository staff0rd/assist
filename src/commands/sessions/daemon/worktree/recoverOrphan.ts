import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { describeHeldWork } from "./describeHeldWork";
import { holdsNoCheckout } from "./holdsNoCheckout";
import { reapWorktree } from "./reapWorktree";
import type { SpawnSession } from "../types";
import {
	type OrphanedWorktree,
	resurfaceOrphanedWorktree,
} from "./resurfaceOrphanedWorktree";
import { surfaceUndeletableLeftover } from "./surfaceUndeletableLeftover";
import { checkDurability } from "./treeDurability";

export async function recoverOrphan(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	orphan: OrphanedWorktree,
	notify: () => void,
): Promise<void> {
	daemonLog(`worktree ${orphan.path} orphaned across restart; reconciling`);
	const durability = await checkDurability(orphan.path);
	if (durability.durable) {
		const removal = await reapWorktree(orphan.path);
		if (!removal.removed && holdsNoCheckout(orphan.path))
			surfaceUndeletableLeftover(
				spawnWith,
				{ ...orphan, reason: removal.reason },
				notify,
			);
		return;
	}
	const held = await describeHeldWork(orphan.path, durability.reason);
	resurfaceOrphanedWorktree(
		sessions,
		spawnWith,
		{ orphan, reason: durability.reason, held },
		notify,
	);
}
