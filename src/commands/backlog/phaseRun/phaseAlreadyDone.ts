import { getReady } from "../shared";
import { isPhaseDone } from "./isPhaseDone";
import { loadPhaseProgress } from "./loadPhaseProgress";

/** Whether a restarted parallel phase session finds its phase already finished, so it has nothing left to do. */
export async function phaseAlreadyDone(
	itemId: number,
	idx: number,
): Promise<boolean> {
	const { orm } = await getReady();
	return isPhaseDone(idx, await loadPhaseProgress(orm, itemId));
}
