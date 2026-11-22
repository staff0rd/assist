import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";

export function autopilotStateColor(
	status: AutopilotStatus,
): "success" | "warning" | "default" {
	if (!status.scheduledHere) return "default";
	return status.paused ? "warning" : "success";
}
