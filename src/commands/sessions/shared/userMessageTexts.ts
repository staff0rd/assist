import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { capText } from "./capText";

const MAX_LENGTH = 2048;

export function userMessageTexts(
	events: ConversationEvent[],
	maxLength = MAX_LENGTH,
): string[] {
	return events.flatMap((event) =>
		event.kind === "message" && event.role === "user"
			? [capText(event.text, maxLength)]
			: [],
	);
}
