import type { ConversationTarget } from "../../../shared/sessionConversationTarget";

export function diffQuery(
	cwd: string,
	conversation?: ConversationTarget,
	scope?: string,
): string {
	const params = new URLSearchParams({ cwd });
	if (conversation) {
		params.set("session", conversation.conversationId);
		if (conversation.harness) params.set("harness", conversation.harness);
	}
	if (scope && scope !== "all") params.set("scope", scope);
	return params.toString();
}
