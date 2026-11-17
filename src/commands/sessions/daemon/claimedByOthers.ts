import type { Session } from "./createSession";
import { forgetTranscriptPath } from "./forgetTranscriptPath";

const boundBy = new Map<string, Session>();

export function claimedByOthers(session: Session): Set<string> {
	const claimed = new Set<string>();
	for (const [conversationId, owner] of boundBy) {
		if (owner.harnessSessionId !== conversationId)
			boundBy.delete(conversationId);
		else if (owner !== session) claimed.add(conversationId);
	}
	return claimed;
}

export function claimConversation(
	session: Session,
	conversationId: string,
): void {
	if (session.harnessSessionId !== conversationId)
		forgetTranscriptPath(session);
	session.harnessSessionId = conversationId;
	boundBy.set(conversationId, session);
}
