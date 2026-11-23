import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";

/** Run now / Pause-Resume availability, shared by the desktop and phone pages. */
export function scheduleControls(status: AutopilotStatus, busy: boolean) {
	const controllable = status.scheduledHere && !busy;
	return {
		runDisabled: !controllable || !!status.running,
		toggleDisabled: !controllable,
		toggle: status.paused ? ("resume" as const) : ("pause" as const),
		toggleLabel: status.paused ? "Resume" : "Pause",
	};
}
