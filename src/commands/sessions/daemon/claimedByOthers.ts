import type { Session } from "./createSession";

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
	session.harnessSessionId = conversationId;
	boundBy.set(conversationId, session);
}
