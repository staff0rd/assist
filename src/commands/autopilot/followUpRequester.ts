import type { AutopilotFollowUp } from "../sessions/daemon/autopilot/AutopilotRecord";

export function followUpRequester(followUp: AutopilotFollowUp): string {
	return followUp.item
		? `${followUp.item} (${followUp.sessionId})`
		: followUp.sessionId;
}
