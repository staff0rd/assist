import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

export function stalledStage(item: AutopilotItemView): string {
	return item.phase > item.totalPhases
		? "Review"
		: `phase ${item.phase} of ${item.totalPhases}`;
}
