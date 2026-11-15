import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { getReady } from "../shared";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "../types";
import { announceWaiting } from "./announceWaiting";
import { launchReady } from "./launchReady";
import { loadPhaseProgress } from "./loadPhaseProgress";
import type { PhaseSchedule } from "./schedulePhases";

export type ParallelRunState = {
	cap: number;
	pauseRequested: boolean;
	itemTree: string;
	spawnOptions?: BacklogRunOptions;
};

/** Start ready phases in their own sessions (unless pausing); true when phases are running, so this run parks until the daemon wakes it. */
export async function parkOnParallelPhases(
	item: BacklogItem,
	plan: PlanPhase[],
	schedule: PhaseSchedule,
	state: ParallelRunState,
): Promise<boolean> {
	if (!state.pauseRequested)
		state.cap = await launchReady(
			item,
			schedule,
			state.cap,
			state.itemTree,
			state.spawnOptions,
		);
	const { orm } = await getReady();
	const { running } = await loadPhaseProgress(orm, item.id);
	if (running.length === 0) return false;
	announceWaiting(item, running, plan.length + 1);
	appendDaemonLog(
		`backlog run ${item.id}: parked while phase ${running.map((idx) => idx + 1).join(", ")} run`,
	);
	return true;
}
