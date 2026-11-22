import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";
import { autopilotState } from "./autopilotState";
import { describeTick } from "./describeTick";

function time(iso: string): string {
	return new Date(iso).toLocaleString();
}

export function formatAutopilotStatus(status: AutopilotStatus): string[] {
	return [
		`${status.cwd} · ${status.prompt}`,
		`  State:     ${autopilotState(status)}`,
		`  Every:     ${status.intervalMinutes} min`,
		`  Next tick: ${status.nextTickAt ? time(status.nextTickAt) : "none"}`,
		`  Last tick: ${status.lastTick ? describeTick(status.lastTick, time) : "none yet"}`,
		...(status.running
			? [
					`  Live run:  ${status.running.sessionId} since ${time(status.running.startedAt)}`,
				]
			: []),
	];
}
