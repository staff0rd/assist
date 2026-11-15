import type { Db } from "../../../shared/db/Db";
import { updateCurrentPhase } from "../updateCurrentPhase";
import { isPhaseDone } from "./isPhaseDone";
import { loadPhaseProgress } from "./loadPhaseProgress";
import { setPhaseRunState } from "./setPhaseRunState";

/**
 * Mark a phase done and move currentPhase to the lowest unfinished phase. The
 * review phase (idx >= planLength) has no row, so it just advances past itself.
 */
export async function markPhaseDone(
	orm: Db,
	itemId: number,
	idx: number,
	planLength: number,
): Promise<void> {
	if (idx >= planLength) {
		await updateCurrentPhase(orm, itemId, idx + 2);
		return;
	}
	await setPhaseRunState(orm, itemId, [idx], "done");
	const progress = await loadPhaseProgress(orm, itemId);
	// why: a plan-less item runs a synthetic phase with no row to hold its state.
	progress.done.push(idx);
	let lowest = (progress.currentPhase ?? 1) - 1;
	while (lowest < planLength && isPhaseDone(lowest, progress)) lowest++;
	if (lowest + 1 > (progress.currentPhase ?? 1))
		await updateCurrentPhase(orm, itemId, lowest + 1);
}
