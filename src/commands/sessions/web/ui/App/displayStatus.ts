import type { SessionInfo, SessionStatus } from "../types";

export type DisplayStatus = SessionStatus | "idle";

export function displayStatus(session: SessionInfo): DisplayStatus {
	if (session.pendingPrPreview && session.status === "running")
		return "waiting";
	if (
		session.watcher &&
		session.status === "running" &&
		session.activity?.watchState !== "updating"
	)
		return "idle";
	return session.status;
}
