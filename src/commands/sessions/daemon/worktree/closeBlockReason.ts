import { daemonLog } from "../daemonLog";
import { liveOccupantReason } from "./liveOccupantReason";
import { checkDurability } from "./treeDurability";
import type { ClosingTree } from "./treeUnderClose";

export async function closeBlockReason(
	sessionId: string,
	tree: ClosingTree,
): Promise<string | undefined> {
	const durability = await checkDurability(tree.path);
	if (!durability.durable) return durability.reason;
	if (durability.gone) {
		daemonLog(
			`session ${sessionId} closing: worktree ${tree.path} is gone from disk — released with nothing to land, not landed work`,
		);
		return undefined;
	}
	return tree.removable ? liveOccupantReason(tree.path) : undefined;
}
