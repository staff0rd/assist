import type { SessionInfo, SessionStatus } from "./types";

export type DisplayStatus = SessionStatus | "idle" | "question" | "check";

export function displayStatus(session: SessionInfo): DisplayStatus {
	const preview = session.pendingPrPreview;
	if (
		preview &&
		preview.kind !== "show" &&
		(session.status === "running" || session.status === "waiting")
	) {
		if (preview.kind === "question") return "question";
		if (preview.kind === "check") return "check";
		return "waiting";
	}
	return session.status;
}
