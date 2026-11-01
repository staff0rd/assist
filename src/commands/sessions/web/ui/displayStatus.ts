import type { SessionInfo, SessionStatus } from "./types";

export type DisplayStatus = SessionStatus | "idle" | "question";

export function displayStatus(session: SessionInfo): DisplayStatus {
	const preview = session.pendingPrPreview;
	if (
		preview &&
		preview.kind !== "show" &&
		(session.status === "running" || session.status === "waiting")
	)
		return preview.kind === "question" ? "question" : "waiting";
	return session.status;
}
