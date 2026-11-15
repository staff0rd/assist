import chalk from "chalk";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { reloadPlan } from "../reloadPlan";
import { getReady } from "../shared";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "../types";
import { launchReady } from "./launchReady";
import { loadPhaseProgress } from "./loadPhaseProgress";
import type { PhaseSchedule } from "./schedulePhases";
import { waitForPhaseProgress } from "./waitForPhaseProgress";

export type ParallelRunState = {
	cap: number;
	pauseRequested: boolean;
	itemTree: string;
	spawnOptions?: BacklogRunOptions;
};

/** Start ready phases in their own sessions (unless pausing), then wait until one of them moves on. */
export async function waitOnParallelPhases(
	item: BacklogItem,
	plan: PlanPhase[],
	schedule: PhaseSchedule,
	state: ParallelRunState,
): Promise<void> {
	if (!state.pauseRequested)
		state.cap = await launchReady(
			item,
			schedule,
			state.cap,
			state.itemTree,
			state.spawnOptions,
		);
	const { orm } = await getReady();
	const launched = await loadPhaseProgress(orm, item.id);
	if (launched.running.length === 0) return;
	console.log(
		chalk.dim(
			`Waiting on phase ${launched.running.map((idx) => idx + 1).join(", ")}, each running in its own session...`,
		),
	);
	await waitForPhaseProgress(
		item.id,
		launched,
		async () => ((await reloadPlan(item.id)) ?? plan).length,
		() => {
			state.pauseRequested = true;
			appendDaemonLog(
				`backlog run ${item.id}: pause requested; waiting for running phases before pausing`,
			);
		},
	);
}
