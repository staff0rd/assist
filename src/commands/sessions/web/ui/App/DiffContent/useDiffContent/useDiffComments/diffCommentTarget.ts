import { resolveHarness } from "../../../../../../../../shared/harnessLabel";
import {
	type ConversationTarget,
	sessionConversationTarget,
} from "../../../../../../shared/sessionConversationTarget";
import { type CommentTarget, commentTarget } from "../../../commentTarget";
import type { SessionInfo } from "../../../../types";

export type DiffCommentSource = {
	ownerSessionId?: string;
	conversation?: ConversationTarget;
};

function holdsConversation(
	session: SessionInfo,
	conversation: ConversationTarget,
): boolean {
	const held = sessionConversationTarget(session);
	return (
		held?.conversationId === conversation.conversationId &&
		resolveHarness(held.harness) === resolveHarness(conversation.harness)
	);
}

export function diffCommentTarget(
	sessions: SessionInfo[],
	{ ownerSessionId, conversation }: DiffCommentSource,
): CommentTarget {
	if (ownerSessionId)
		return commentTarget(sessions.find((s) => s.id === ownerSessionId));
	if (!conversation)
		return {
			unavailable: "Open this diff from a session card to comment on it.",
		};
	return commentTarget(
		sessions.find((s) => holdsConversation(s, conversation)),
	);
}
