import type { SessionInfo } from "../types";

export function attentionMessage(session: SessionInfo): string | undefined {
	if (session.status === "error") return session.error;
	return session.pendingPrPreview?.title ?? session.lastAssistantMessage;
}
