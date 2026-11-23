import { clockTime } from "./clockTime";
import { followUpRequester } from "../../../../../../../autopilot/followUpRequester";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";

export function nextTickLabel(status: AutopilotStatus): string {
	const { followUp, nextTickAt } = status;
	if (followUp && nextTickAt === followUp.at)
		return `${clockTime(nextTickAt)} · follow-up by ${followUpRequester(followUp)}`;
	if (nextTickAt) return clockTime(nextTickAt);
	return status.paused ? "none while paused" : "none on this node";
}
