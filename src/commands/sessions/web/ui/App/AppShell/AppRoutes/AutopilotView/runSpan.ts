import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { clockTime } from "./clockTime";
import { runTime } from "./runTime";

export function runSpan(run: AutopilotTick): string {
	return run.startedAt
		? `${runTime(run.startedAt)}–${clockTime(run.at)}`
		: runTime(run.at);
}
