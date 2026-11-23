import type { AutopilotRun } from "./AutopilotRecord";
import type { AutopilotSessionState } from "./autopilotSessionState";

/* why: an idle run is held open this long after being prompted for its summary,
 * then recorded without one. */
const SUMMARY_GRACE_MS = 10 * 60_000;

export function awaitingSummary(
	run: AutopilotRun,
	state: AutopilotSessionState,
): boolean {
	if (state !== "ended" || run.summary || !run.summaryRequestedAt) return false;
	return Date.now() - Date.parse(run.summaryRequestedAt) < SUMMARY_GRACE_MS;
}
