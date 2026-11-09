import type { HarnessKind } from "../../../shared/harnesses";

export type ConversationTarget = {
	conversationId: string;
	harness?: HarnessKind;
};

type ConversationIds = {
	harness?: HarnessKind;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export function sessionConversationTarget(
	session: ConversationIds,
): ConversationTarget | undefined {
	const conversationId = session.claudeSessionId ?? session.harnessSessionId;
	if (!conversationId) return undefined;
	return session.harness
		? { conversationId, harness: session.harness }
		: { conversationId };
}
