import { withoutResumeSession } from "../../../shared/spawnClaude";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { executePhase } from "../executePhase";
import { getReady } from "../shared";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "../types";
import { markPhaseDone } from "./markPhaseDone";
import { setPhaseRunState } from "./setPhaseRunState";
import { ownsPhase } from "./ownsPhase";

type ParallelPhaseOptions = BacklogRunOptions & {
	token: string;
	itemTree: string;
};

export async function runUntilSettled(
	item: BacklogItem,
	idx: number,
	plan: PlanPhase[],
	options: ParallelPhaseOptions,
	watcher: { cancelled: () => boolean },
): Promise<boolean> {
	const { token, itemTree: _itemTree, ...spawnOptions } = options;
	let phaseOptions: BacklogRunOptions | undefined = spawnOptions;
	while (true) {
		const outcome = await executePhase(
			item,
			idx,
			plan,
			phaseOptions,
			plan.length + 1,
			false,
		);
		phaseOptions = withoutResumeSession(phaseOptions);
		if (watcher.cancelled()) return false;
		if (outcome.kind === "retry") continue;
		if (outcome.kind === "advance") return true;
		const { orm } = await getReady();
		if (!(await ownsPhase(item.id, idx, token))) return false;
		if (outcome.kind === "skip") {
			await markPhaseDone(orm, item.id, idx, plan.length);
			return true;
		}
		appendDaemonLog(
			`backlog run-phase ${item.id} phase ${idx + 1}: ${outcome.kind}; marking it failed`,
		);
		await setPhaseRunState(orm, item.id, [idx], "failed");
		return false;
	}
}
