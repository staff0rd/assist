import { decideLap, type LapEnd } from "../../../watch/decideLap";
import { WATCH_LAP_ARGS } from "../../../watch/runWatchLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { holdForEscalation } from "./holdForEscalation";
import { runLapCapturingTail } from "./runLapCapturingTail";

const DIVERGED_EXIT_CODE = 3;
export const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

export async function runAutoUpdateLoop(
	deps: AutoUpdateDeps,
	maxLaps = Number.POSITIVE_INFINITY,
): Promise<void> {
	let held = deps.liveEscalation();
	for (let lap = 1; lap <= maxLaps; lap++) {
		if (held) await holdForEscalation(held, deps);
		held = undefined;
		deps.note(
			`lap ${lap} at ${new Date().toLocaleString()}: assist ${WATCH_LAP_ARGS.join(" ")}`,
		);
		let result: { end: LapEnd; tail: string };
		try {
			result = await runLapCapturingTail(deps);
		} catch (error) {
			deps.note(
				`lap ${lap} could not start (${error instanceof Error ? error.message : String(error)}); retrying in ${RETRY_AFTER_FAILURE_MS / 60000}m`,
			);
			await deps.sleep(RETRY_AFTER_FAILURE_MS);
			continue;
		}
		const { end, tail } = result;
		const how = end.signal ? `killed by ${end.signal}` : `exited ${end.code}`;
		if (end.code === DIVERGED_EXIT_CODE) {
			held = deps.escalate(tail);
			deps.note(`lap ${lap} ${how} (divergence); escalated to session ${held}`);
			continue;
		}
		if (decideLap(end, false).kind === "relaunch") {
			deps.note(`lap ${lap} ${how}; relaunching`);
			continue;
		}
		deps.note(
			`lap ${lap} ${how}; retrying in ${RETRY_AFTER_FAILURE_MS / 60000}m`,
		);
		await deps.sleep(RETRY_AFTER_FAILURE_MS);
	}
}
