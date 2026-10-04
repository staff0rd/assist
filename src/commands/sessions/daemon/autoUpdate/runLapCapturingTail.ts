import type { LapEnd } from "../../../watch/decideLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";

const OUTPUT_TAIL = 16 * 1024;

export async function runLapCapturingTail(
	deps: AutoUpdateDeps,
): Promise<{ end: LapEnd; tail: string }> {
	let tail = "";
	const end = await deps.runLap((text) => {
		tail = (tail + text).slice(-OUTPUT_TAIL);
		deps.record(text);
	});
	return { end, tail };
}
