import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";
import { autopilotState } from "./autopilotState";
import { describeTick } from "./describeTick";
import { followUpRequester } from "./followUpRequester";

function time(iso: string): string {
	return new Date(iso).toLocaleString();
}

export function formatAutopilotStatus(status: AutopilotStatus): string[] {
	return [
		`${status.cwd} · ${status.prompt}`,
		`  State:     ${autopilotState(status)}`,
		`  Every:     ${status.intervalMinutes} min`,
		`  Next tick: ${status.nextTickAt ? time(status.nextTickAt) : "none"}`,
		...(status.followUp
			? [
					`  Follow-up: ${time(status.followUp.at)}, requested by ${followUpRequester(status.followUp)}`,
				]
			: []),
		`  Last tick: ${status.lastTick ? describeTick(status.lastTick, time) : "none yet"}`,
		...(status.running
			? [
					`  Live run:  ${status.running.sessionId} since ${time(status.running.startedAt)}`,
				]
			: []),
	];
}
