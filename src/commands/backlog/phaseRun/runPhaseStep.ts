import type { BacklogItem, BacklogRunOptions, PlanPhase } from "../types";
import { inlinePhase } from "./inlinePhase";
import type { PhasesResult } from "./PhasesResult";
import { runInlinePhase } from "./runInlinePhase";
import type { PhaseSchedule } from "./schedulePhases";
import {
	type ParallelRunState,
	waitOnParallelPhases,
} from "./waitOnParallelPhases";

type StepResult = {
	stop?: PhasesResult;
	preferred?: number;
	ranInline: boolean;
};

/** One pass of the phase loop: run the lone ready phase here, or start ready phases in parallel and wait on them. */
export async function runPhaseStep(
	item: BacklogItem,
	plan: PlanPhase[],
	schedule: PhaseSchedule,
	parallel: ParallelRunState,
	preferred: number | undefined,
	phaseOptions?: BacklogRunOptions,
): Promise<StepResult> {
	const inline: number | undefined = parallel.pauseRequested
		? undefined
		: inlinePhase(schedule, parallel.cap, preferred);
	if (inline === undefined) {
		await waitOnParallelPhases(item, plan, schedule, parallel);
		return { preferred, ranInline: false };
	}
	const result = await runInlinePhase(item, inline, plan, phaseOptions);
	return { ...result, ranInline: true };
}
