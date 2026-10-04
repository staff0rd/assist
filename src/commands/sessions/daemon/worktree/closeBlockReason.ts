import { daemonLog } from "../daemonLog";
import { liveOccupantReason } from "./liveOccupantReason";
import { checkDurability } from "./treeDurability";
import type { ClosingTree } from "./treeUnderClose";

type CloseBlock = { reason: string; live: boolean };

export async function closeBlockReason(
	sessionId: string,
	tree: ClosingTree,
): Promise<CloseBlock | undefined> {
	const durability = await checkDurability(tree.path);
	if (!durability.durable) return { reason: durability.reason, live: false };
	if (durability.gone) {
		daemonLog(
			`session ${sessionId} closing: worktree ${tree.path} is gone from disk — released with nothing to land, not landed work`,
		);
		return undefined;
	}
	const occupied = tree.removable ? liveOccupantReason(tree.path) : undefined;
	return occupied ? { reason: occupied, live: true } : undefined;
}
