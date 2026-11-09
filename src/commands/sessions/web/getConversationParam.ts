import type { IncomingMessage } from "node:http";
import { conversationFromParams } from "../shared/conversationFromParams";
import type { ConversationTarget } from "../shared/sessionConversationTarget";

export function getConversationParam(
	req: IncomingMessage,
): ConversationTarget | undefined {
	const url = new URL(req.url ?? "/", "http://localhost");
	return conversationFromParams(url.searchParams);
}
