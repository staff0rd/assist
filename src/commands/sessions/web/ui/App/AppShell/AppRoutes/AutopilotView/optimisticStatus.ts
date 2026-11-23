import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotAction } from "./postAutopilotControl";

/** The status the action will produce, shown before the server confirms it. */
export function optimisticStatus(
	action: AutopilotAction,
	status: AutopilotStatus,
): AutopilotStatus {
	if (action === "pause") return { ...status, paused: true, nextTickAt: null };
	if (action === "resume") return { ...status, paused: false, failure: null };
	return status;
}
