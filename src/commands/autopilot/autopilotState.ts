import type { AutopilotStatus } from "../sessions/daemon/autopilot/AutopilotStatus";

export function autopilotState(status: AutopilotStatus): string {
	if (!status.scheduledHere)
		return status.node
			? `Runs on ${status.node}`
			: "Off (autopilot.node unset)";
	return status.paused ? "Paused" : "Running";
}
