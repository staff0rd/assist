import { resolveDependsOn } from "../dependsOn/resolveDependsOn";
import type { PlanPhase } from "../types";
import { isPhaseDone } from "./isPhaseDone";
import type { PhaseProgress } from "./PhaseProgress";

export type PhaseSchedule = {
	allDone: boolean;
	running: number[];
	ready: number[];
	failed: number[];
};

/** 0-based dependencies of a plan phase, whose authored dependsOn is 1-based. */
export function phaseDependencies(plan: PlanPhase[], idx: number): number[] {
	return resolveDependsOn(
		plan[idx]?.dependsOn?.map((dep) => dep - 1),
		idx,
	);
}

/** Which unfinished phases are running, failed, or ready to start because every dependency is done. */
export function schedulePhases(
	plan: PlanPhase[],
	progress: PhaseProgress,
): PhaseSchedule {
	const pending = plan
		.map((_, idx) => idx)
		.filter((idx) => !isPhaseDone(idx, progress));
	const running = pending.filter((idx) => progress.running.includes(idx));
	const failed = pending.filter((idx) => progress.failed.includes(idx));
	const ready = pending.filter(
		(idx) =>
			!running.includes(idx) &&
			!failed.includes(idx) &&
			phaseDependencies(plan, idx).every((dep) => isPhaseDone(dep, progress)),
	);
	return { allDone: pending.length === 0, running, ready, failed };
}
