import { type CommentTarget, commentTarget } from "../../../../commentTarget";
import type { SessionInfo } from "../../../../../types";

export function fileCommentTarget(
	sessions: SessionInfo[],
	cardId: string | null,
): CommentTarget {
	if (!cardId)
		return {
			unavailable: "Select a session card to comment on this file.",
		};
	return commentTarget(sessions.find((s) => s.id === cardId));
}
