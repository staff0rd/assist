import { launchParallelPhase } from "./launchParallelPhase";
import type { PhaseSchedule } from "./schedulePhases";
import type { BacklogItem, BacklogRunOptions } from "../types";

/** Start ready phases in their own sessions up to the cap; returns the cap, dropped to 1 if a launch fails. */
export async function launchReady(
	item: BacklogItem,
	schedule: PhaseSchedule,
	cap: number,
	itemTree: string,
	spawnOptions?: BacklogRunOptions,
): Promise<number> {
	const slots = Math.max(0, cap - schedule.running.length);
	for (const idx of schedule.ready.slice(0, slots)) {
		if (!(await launchParallelPhase(item, idx, itemTree, spawnOptions)))
			return 1;
	}
	return cap;
}
