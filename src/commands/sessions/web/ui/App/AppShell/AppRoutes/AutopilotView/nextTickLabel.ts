import { followUpRequester } from "../../../../../../../autopilot/followUpRequester";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";

export function nextTickLabel(status: AutopilotStatus): string {
	const { followUp, nextTickAt } = status;
	if (followUp && nextTickAt === followUp.at)
		return `${time(nextTickAt)} · follow-up by ${followUpRequester(followUp)}`;
	if (nextTickAt) return time(nextTickAt);
	return status.paused ? "none while paused" : "none on this node";
}

function time(iso: string): string {
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}
