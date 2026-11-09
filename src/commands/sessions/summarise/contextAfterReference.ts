import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { isBareReferencePrompt } from "../shared/isReferenceOnlyPrompt";

const MIN_CONTEXT_CHARS = 120;
const MAX_CONTEXT_CHARS = 800;
const SKILL_INVOCATION = /^[/$]\S+\s*/;

function isOpeningReference(text: string): boolean {
	if (isBareReferencePrompt(text)) return true;
	if (!SKILL_INVOCATION.test(text)) return false;
	const args = text.replace(SKILL_INVOCATION, "");
	return !args || isBareReferencePrompt(args);
}

function eventText(event: ConversationEvent): string {
	return event.kind === "tool" ? "" : event.text.trim();
}

export function contextAfterReference(
	events: ConversationEvent[],
): string | undefined {
	const parts: string[] = [];
	let length = 0;
	for (const event of events) {
		const text = eventText(event);
		if (!text) continue;
		if (parts.length === 0 && isOpeningReference(text)) continue;
		parts.push(text);
		length += text.length;
		if (length >= MAX_CONTEXT_CHARS) break;
	}
	if (length < MIN_CONTEXT_CHARS) return undefined;
	return parts.join("\n").slice(0, MAX_CONTEXT_CHARS);
}
