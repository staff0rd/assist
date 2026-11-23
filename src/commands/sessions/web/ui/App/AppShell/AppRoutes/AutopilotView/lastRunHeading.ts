import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { runItemsText } from "./runItemsText";
import { runSpan } from "./runSpan";

export function lastRunHeading(run: AutopilotTick): string {
	return [runSpan(run), runItemsText(run), run.reason]
		.filter(Boolean)
		.join(" · ");
}
