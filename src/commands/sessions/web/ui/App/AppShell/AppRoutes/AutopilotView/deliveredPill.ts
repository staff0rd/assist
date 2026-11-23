import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { clockTime } from "./clockTime";

export function deliveredPill(item: AutopilotItemView): {
	label: string;
	color: string;
} {
	const at = item.finishedAt ? ` ${clockTime(item.finishedAt)}` : "";
	if (item.status === "done")
		return { label: `done${at}`, color: "success.main" };
	if (item.status === "wontdo")
		return { label: `won't do${at}`, color: "text.secondary" };
	return { label: `stopped at phase ${item.phase}`, color: "error.main" };
}
