import type { SessionInfo } from "../../types";

export function askedText(session: SessionInfo): string {
	return session.pendingPrPreview?.title ?? session.lastAssistantMessage ?? "";
}
