import { discardCancelledPhase } from "./discardCancelledPhase";
import { phaseCancelled } from "./phaseCancelled";

/** Once a parallel phase stops, drop its unlanded work if a rewind or stop cancelled it. */
export async function discardIfCancelled(
	itemId: number,
	idx: number,
	token: string,
	itemTree: string,
): Promise<void> {
	if (await phaseCancelled(itemId, idx, token))
		discardCancelledPhase(
			itemTree,
			`backlog run-phase ${itemId} phase ${idx + 1}`,
		);
}
