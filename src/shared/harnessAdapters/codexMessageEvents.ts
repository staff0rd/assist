import {
	rolloutPayload,
	rolloutString,
} from "../../commands/sessions/shared/codex/parseRolloutEntry";
import { codexCompletedToolEvents } from "./codexCompletedToolEvents";
import { codexContentText } from "./codexContentText";
import type { ConversationEvent } from "./types";

type Payload = Record<string, unknown>;

const REPLAYED_CONTEXT = [
	"<environment_context>",
	"<user_instructions>",
	"<INSTRUCTIONS>",
	"<turn_aborted>",
	"# AGENTS.md instructions",
	"# Instructions for this repo (composed by assist)",
];

function isReplayedContext(text: string): boolean {
	return REPLAYED_CONTEXT.some((marker) => text.startsWith(marker));
}

function message(
	role: "user" | "assistant",
	raw: string,
	at?: string,
): ConversationEvent[] {
	const text = raw.trim();
	if (!text || (role === "user" && isReplayedContext(text))) return [];
	return [{ kind: "message", role, text, at }];
}

function completedItem(payload: Payload, at?: string): ConversationEvent[] {
	const item = rolloutPayload({ payload: payload.item });
	if (item.type === "UserMessage")
		return message("user", codexContentText(item.content), at);
	if (item.type === "AgentMessage")
		return message("assistant", codexContentText(item.content), at);
	return codexCompletedToolEvents(item, at);
}

export function codexMessageEvents(
	payload: Payload,
	at?: string,
): ConversationEvent[] {
	if (payload.type === "user_message")
		return message("user", rolloutString(payload.message), at);
	if (payload.type === "agent_message")
		return message("assistant", rolloutString(payload.message), at);
	if (payload.type === "item_completed") return completedItem(payload, at);
	return [];
}
