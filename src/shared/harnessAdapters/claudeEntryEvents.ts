import { normalizeUser } from "../../commands/sessions/shared/normalizeUser";
import { renderUserPrompt } from "../../commands/sessions/shared/renderUserPrompt";
import { claudeAssistantEvents } from "./claudeAssistantEvents";
import { claudeContentBlocksOf } from "./claudeContentBlocksOf";
import type { ConversationEvent } from "./types";

type Entry = Record<string, unknown>;

function contentOf(entry: Entry): unknown {
	return (entry.message as { content?: unknown } | undefined)?.content;
}

function resultText(content: unknown): string {
	if (typeof content === "string") return content;
	return claudeContentBlocksOf(content)
		.filter((block) => block.type === "text")
		.map((block) => String(block.text ?? ""))
		.join("\n");
}

function userEvents(entry: Entry, at?: string): ConversationEvent[] {
	const events: ConversationEvent[] = [];
	const text = renderUserPrompt(entry, Number.POSITIVE_INFINITY);
	if (text) events.push({ kind: "message", role: "user", text, at });
	else if (normalizeUser(entry).kind === "interrupt")
		events.push({ kind: "interrupt", at });
	for (const block of claudeContentBlocksOf(contentOf(entry))) {
		if (block.type !== "tool_result" || block.is_error) continue;
		const body = resultText(block.content).trim();
		if (body) events.push({ kind: "toolResult", text: body, at });
	}
	return events;
}

export function claudeEntryEvents(entry: Entry): ConversationEvent[] {
	if (entry.isSidechain || entry.isMeta) return [];
	const at = typeof entry.timestamp === "string" ? entry.timestamp : undefined;
	if (entry.type === "user") return userEvents(entry, at);
	if (entry.type === "assistant")
		return claudeAssistantEvents(contentOf(entry), at);
	return [];
}
