import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { stalledStage } from "./stalledStage";

export function deliveredLine(item: AutopilotItemView): string {
	if (item.delivered) return `Delivered: ${item.delivered}`;
	if (item.status === "done")
		return "Done, but its Review recorded no Delivered statement.";
	if (item.status === "wontdo") return "Not delivered: marked won't do.";
	const progress = `${item.donePhases} of ${item.totalPhases} phases built`;
	const aim = item.why ? ` It set out to: ${item.why}` : "";
	return `Not delivered: stalled in ${stalledStage(item)} with ${progress} and nothing running it.${aim}`;
}
