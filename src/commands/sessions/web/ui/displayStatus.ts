import type { SessionInfo, SessionStatus } from "./types";

const QUESTION_KINDS = new Set<string | undefined>([
	"question",
	"backlog-item",
	"github-issue",
	"github-issue-edit",
	"github-issue-comment",
	"pr-comment",
	"design",
]);

export type DisplayStatus = SessionStatus | "idle" | "question" | "check";

export function displayStatus(session: SessionInfo): DisplayStatus {
	const preview = session.pendingPrPreview;
	if (
		preview &&
		preview.kind !== "show" &&
		(session.status === "running" || session.status === "waiting")
	) {
		if (QUESTION_KINDS.has(preview.kind)) return "question";
		if (preview.kind === "check") return "check";
		return "waiting";
	}
	return session.status;
}
