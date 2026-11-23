import type { Activity } from "../../../../shared/emitActivity";

/** "Review" for the run's appended review phase, else "phase N of M". */
export function activityPhaseLabel(
	activity: Activity | undefined,
): string | undefined {
	const phase = activity?.phase;
	if (phase === undefined) return undefined;
	const total = activity?.totalPhases;
	if (total === undefined) return `phase ${phase}`;
	return phase >= total ? "Review" : `phase ${phase} of ${total - 1}`;
}
