import { type CommentTarget, commentTarget } from "../../../commentTarget";
import type { SessionInfo } from "../../../../types";

export function diffCommentTarget(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
): CommentTarget {
	if (!claudeSessionId)
		return {
			unavailable: "Open this diff from a session card to comment on it.",
		};
	return commentTarget(
		sessions.find((s) => s.claudeSessionId === claudeSessionId),
	);
}
