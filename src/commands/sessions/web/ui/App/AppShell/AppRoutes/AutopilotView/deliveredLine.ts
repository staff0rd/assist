import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";

export function deliveredLine(item: AutopilotItemView): string {
	if (item.delivered) return `Delivered: ${item.delivered}`;
	if (item.status === "done") return "Delivered: no statement recorded.";
	if (item.status === "wontdo") return "Not delivered: marked won't do.";
	return `Delivered ${item.donePhases} of ${item.totalPhases} phases; stopped at phase ${item.phase} with no live session.`;
}
