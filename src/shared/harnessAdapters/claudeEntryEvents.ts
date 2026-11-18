import { claudeAssistantEvents } from "./claudeAssistantEvents";
import type { ConversationEvent } from "./types";
import { claudeUserEvents } from "./claudeUserEvents";

type Entry = Record<string, unknown>;

function contentOf(entry: Entry): unknown {
	return (entry.message as { content?: unknown } | undefined)?.content;
}

function queuedPromptOf(entry: Entry): unknown {
	const attachment = entry.attachment as Entry | undefined;
	if (
		attachment?.type !== "queued_command" ||
		attachment.commandMode !== "prompt" ||
		attachment.isMeta
	)
		return undefined;
	return attachment.prompt;
}

/* why: a queued prompt Claude Code absorbs mid-turn is recorded only as a
 * queued_command attachment, with no user row, so it is read as one. */
function attachmentEvents(entry: Entry, at?: string): ConversationEvent[] {
	const prompt = queuedPromptOf(entry);
	if (prompt === undefined) return [];
	return claudeUserEvents(
		{ type: "user", message: { role: "user", content: prompt } },
		at,
	);
}

export function claudeEntryEvents(
	entry: Entry,
	resultUrls?: ReadonlyMap<string, string>,
): ConversationEvent[] {
	if (entry.isSidechain || entry.isMeta) return [];
	const at = typeof entry.timestamp === "string" ? entry.timestamp : undefined;
	if (entry.type === "user") return claudeUserEvents(entry, at);
	if (entry.type === "attachment") return attachmentEvents(entry, at);
	if (entry.type === "assistant")
		return claudeAssistantEvents(contentOf(entry), at, resultUrls);
	return [];
}
