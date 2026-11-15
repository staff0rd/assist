import chalk from "chalk";
import type { PhaseSchedule } from "./schedulePhases";
import type { PhasesResult } from "./PhasesResult";

/** How the phase loop ends now, or undefined while phases are still running or ready. */
export function settledResult(
	schedule: PhaseSchedule,
	pauseRequested: boolean,
): PhasesResult | undefined {
	if (schedule.allDone) return { kind: "completed" };
	if (schedule.running.length > 0) return undefined;
	if (pauseRequested) return { kind: "paused" };
	if (schedule.failed.length === 0 && schedule.ready.length > 0)
		return undefined;
	console.log(
		chalk.red(
			`Phase ${schedule.failed.map((idx) => idx + 1).join(", ") || "?"} did not complete; stopping the run.`,
		),
	);
	return { kind: "fail" };
}
