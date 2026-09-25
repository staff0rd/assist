import type { SessionInfo, SessionStatus } from "../../../types";

export function displayStatus(session: SessionInfo): SessionStatus {
	if (session.pendingPrPreview && session.status === "running")
		return "waiting";
	return session.status;
}
