import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { capText } from "./capText";
import { sessionMessageBody } from "./parseSessionMessage";

export function lastMessageText(
	events: ConversationEvent[],
	role: "user" | "assistant",
	maxLength: number,
): string | undefined {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.kind === "message" && event.role === role)
			return capText(sessionMessageBody(event.text), maxLength);
	}
	return undefined;
}
