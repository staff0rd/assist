import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";

export function autopilotStateColor(
	status: AutopilotStatus,
): "success" | "warning" | "error" | "default" {
	if (!status.scheduledHere) return "default";
	if (status.pauseReason) return "error";
	return status.paused ? "warning" : "success";
}
