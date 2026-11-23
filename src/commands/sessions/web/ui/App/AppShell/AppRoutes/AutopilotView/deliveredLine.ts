import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { stalledStage } from "./stalledStage";

export function deliveredLine(item: AutopilotItemView): string {
	if (item.delivered) return `Delivered: ${item.delivered}`;
	if (item.status === "done") return "Delivered: no statement recorded.";
	if (item.status === "wontdo") return "Not delivered: marked won't do.";
	const done = item.summary ? `${item.summary} ` : "";
	return `${done}Stalled in ${stalledStage(item)}: no session is running it, so it is not done.`;
}
