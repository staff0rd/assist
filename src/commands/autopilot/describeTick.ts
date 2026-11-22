import type { AutopilotTick } from "../sessions/daemon/autopilot/AutopilotRecord";

export function describeTick(
	tick: AutopilotTick,
	time: (iso: string) => string,
): string {
	const detail = tick.reason ?? tick.sessionId;
	return `${time(tick.at)} · ${tick.outcome}${detail ? `, ${detail}` : ""}`;
}
