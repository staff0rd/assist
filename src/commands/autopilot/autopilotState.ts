import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";

export function autopilotState(status: AutopilotStatus): string {
	if (!status.scheduledHere)
		return status.node
			? `Runs on ${status.node}`
			: "Off (autopilot.node unset)";
	if (status.pauseReason) return "Paused · failed";
	return status.paused ? "Paused" : "Running";
}
