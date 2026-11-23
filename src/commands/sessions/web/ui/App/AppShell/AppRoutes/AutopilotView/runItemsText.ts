import { formatItemId } from "../../../../../../../backlog/formatItemId";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";

export function runItemsText(run: AutopilotTick): string {
	return run.items?.length
		? `started ${run.items.map(formatItemId).join(", ")}`
		: "started no item";
}
