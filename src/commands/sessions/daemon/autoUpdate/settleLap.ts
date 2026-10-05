import { decideLap, type LapEnd } from "../../../watch/decideLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { backOff } from "./backOff";

const DIVERGED_EXIT_CODE = 3;

export async function settleLap(
	lap: number,
	{ end, tail }: { end: LapEnd; tail: string },
	deps: AutoUpdateDeps,
): Promise<string | undefined> {
	const how = end.signal ? `killed by ${end.signal}` : `exited ${end.code}`;
	if (end.code === DIVERGED_EXIT_CODE) {
		const held = deps.escalate(tail);
		deps.note(`lap ${lap} ${how} (divergence); escalated to session ${held}`);
		return held;
	}
	if (deps.paused()) deps.note(`lap ${lap} ${how}; paused`);
	else if (decideLap(end, false).kind === "relaunch")
		deps.note(`lap ${lap} ${how}; relaunching`);
	else await backOff(`lap ${lap} ${how}`, deps);
	return undefined;
}
