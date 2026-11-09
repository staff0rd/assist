import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { capText } from "../shared/capText";

const MAX_CHARS = 500;

export function firstUserMessage(
	events: ConversationEvent[],
): string | undefined {
	for (const event of events)
		if (event.kind === "message" && event.role === "user")
			return capText(event.text.trim(), MAX_CHARS);
	return undefined;
}
