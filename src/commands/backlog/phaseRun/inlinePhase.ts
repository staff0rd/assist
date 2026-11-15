import type { PhaseSchedule } from "./schedulePhases";

/** The phase to run in this session: only when nothing runs alongside it and it is the one ready phase (or parallel runs are off). */
export function inlinePhase(
	schedule: PhaseSchedule,
	cap: number,
	preferred: number | undefined,
): number | undefined {
	if (schedule.running.length > 0 || schedule.ready.length === 0)
		return undefined;
	if (cap > 1 && schedule.ready.length > 1) return undefined;
	return preferred !== undefined && schedule.ready.includes(preferred)
		? preferred
		: schedule.ready[0];
}
