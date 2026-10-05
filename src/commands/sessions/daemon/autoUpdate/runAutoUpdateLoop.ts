import { WATCH_LAP_ARGS } from "../../../watch/runWatchLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { backOff } from "./backOff";
import { holdForEscalation } from "./holdForEscalation";
import { runLapCapturingTail } from "./runLapCapturingTail";
import { settleLap } from "./settleLap";

export const PAUSE_POLL_MS = 60 * 1000;

export async function runAutoUpdateLoop(
	deps: AutoUpdateDeps,
	maxLaps = Number.POSITIVE_INFINITY,
): Promise<void> {
	let held = deps.liveEscalation();
	for (let lap = 1; lap <= maxLaps; lap++) {
		if (held) await holdForEscalation(held, deps);
		held = undefined;
		while (deps.paused()) await deps.sleep(PAUSE_POLL_MS);
		deps.enter("waiting");
		deps.note(
			`lap ${lap} at ${new Date().toLocaleString()}: assist ${WATCH_LAP_ARGS.join(" ")}`,
		);
		try {
			held = await settleLap(lap, await runLapCapturingTail(deps), deps);
		} catch (error) {
			await backOff(
				`lap ${lap} could not start (${error instanceof Error ? error.message : String(error)})`,
				deps,
			);
		}
	}
}
