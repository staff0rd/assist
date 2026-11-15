import type { Db } from "../../../shared/db/Db";
import { findPhaseBySessionId } from "../../../shared/db/findPhaseBySessionId";
import type { BacklogItem } from "../types";

/**
 * Whether the conversation a restart would resume belongs to a phase that is
 * done while later phases ran on in parallel: the run's own session last
 * hosted that phase, so resuming it would wrongly rewind the run onto it.
 */
export async function resumeSuperseded(
	orm: Db,
	item: BacklogItem,
	resumeSessionId: string,
): Promise<boolean> {
	if (!item.donePhases?.length) return false;
	const idx = await findPhaseBySessionId(orm, item.id, resumeSessionId);
	if (idx === undefined || !item.donePhases?.includes(idx + 1)) return false;
	return (
		(item.runningPhases?.length ?? 0) > 0 ||
		item.donePhases.some((phase) => phase > idx + 1)
	);
}
