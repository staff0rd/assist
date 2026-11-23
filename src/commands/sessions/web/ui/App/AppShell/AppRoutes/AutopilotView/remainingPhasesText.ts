import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

export function remainingPhasesText(
	remaining: AutopilotItemView["remaining"],
): string {
	return remaining
		.map((phase) =>
			phase.number === null ? phase.name : `${phase.number} ${phase.name}`,
		)
		.join(" · ");
}
