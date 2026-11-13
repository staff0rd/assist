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
import type { Leftover } from "./Leftover";
import { markLeftover } from "./readWorktreeRegistry";
import { reportLeftoversEnabled } from "./reportLeftoversEnabled";
import { checkDurability } from "./treeDurability";

export async function recoverOrphan(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	orphan: OrphanedWorktree,
	notify: () => void,
): Promise<Leftover | undefined> {
	daemonLog(`worktree ${orphan.path} orphaned across restart; reconciling`);
	const durability = await checkDurability(orphan.path);
	if (durability.durable) {
		const removal = await reapWorktree(orphan.path);
		if (
			removal.removed ||
			!holdsNoCheckout(orphan.path) ||
			!reportLeftoversEnabled()
		)
			return undefined;
		markLeftover(orphan.path, removal.reason);
		return { path: orphan.path, reason: removal.reason };
	}
	const held = await describeHeldWork(orphan.path, durability.reason);
	resurfaceOrphanedWorktree(
		sessions,
		spawnWith,
		{ orphan, reason: durability.reason, held },
		notify,
	);
	return undefined;
}
