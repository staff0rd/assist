import { withoutResumeSession } from "../../shared/spawnClaude";
import { loadPhaseProgress } from "./phaseRun/loadPhaseProgress";
import { parallelPhaseCap } from "./phaseRun/parallelPhaseCap";
import type { PhasesResult } from "./phaseRun/PhasesResult";
import { runPhaseStep } from "./phaseRun/runPhaseStep";
import { schedulePhases } from "./phaseRun/schedulePhases";
import { settledResult } from "./phaseRun/settledResult";
import type { ParallelRunState } from "./phaseRun/parkOnParallelPhases";
import { isWake } from "./phaseRun/isWake";
import { consumePause } from "./consumePause";
import { reloadPlan } from "./reloadPlan";
import { getReady } from "./shared";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";

/**
 * Run every phase whose dependencies are done: a lone ready phase runs in this
 * session on the item branch; several run at once, each in its own session
 * and worktree, up to the parallel cap, and this run parks until the daemon
 * wakes it once they end.
 */
export async function runPhases(
	item: BacklogItem,
	startPhase: number,
	plan: PlanPhase[],
	spawnOptions?: BacklogRunOptions,
): Promise<PhasesResult> {
	const itemTree = process.cwd();
	const parallel: ParallelRunState = {
		cap: parallelPhaseCap(itemTree),
		// why: a pause requested while parked applies once the daemon wakes the run.
		pauseRequested: isWake() && consumePause(item.id),
		itemTree,
		spawnOptions: withoutResumeSession(spawnOptions),
	};
	let currentPlan = plan;
	let preferred: number | undefined = startPhase;
	/* why: only the first phase after a restart resumes its interrupted Claude
	 * session; every phase after it starts a fresh conversation. */
	let phaseOptions = spawnOptions;
	const { orm } = await getReady();
	while (true) {
		const schedule = schedulePhases(
			currentPlan,
			await loadPhaseProgress(orm, item.id),
		);
		const settled = settledResult(schedule, parallel.pauseRequested);
		if (settled) return settled;
		const step = await runPhaseStep(
			item,
			currentPlan,
			schedule,
			parallel,
			preferred,
			phaseOptions,
		);
		if (step.stop) return step.stop;
		preferred = step.preferred;
		if (step.ranInline) phaseOptions = withoutResumeSession(phaseOptions);
		// Re-resolve from the DB so phases added mid-run (e.g. appended to the end
		// while the last phase is executing) extend the loop instead of being
		// skipped in favour of the review phase.
		currentPlan = (await reloadPlan(item.id)) ?? currentPlan;
	}
}
