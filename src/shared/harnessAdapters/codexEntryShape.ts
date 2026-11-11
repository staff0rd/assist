import {
	rolloutPayload,
	rolloutString,
} from "../../commands/sessions/shared/codex/parseRolloutEntry";

type Entry = Record<string, unknown>;

const PAYLOAD_TYPES = new Map([
	[
		"event_msg",
		new Set([
			"user_message",
			"agent_message",
			"agent_reasoning",
			"item_started",
			"token_count",
			"task_started",
			"task_complete",
			"turn_aborted",
			"thread_settings_applied",
		]),
	],
	[
		"response_item",
		new Set([
			"message",
			"reasoning",
			"additional_tools",
			"function_call",
			"function_call_output",
			"custom_tool_call",
			"custom_tool_call_output",
			"local_shell_call",
		]),
	],
]);

const IGNORED_ENTRY_TYPES = new Set([
	"session_meta",
	"turn_context",
	"token_usage_record",
	"world_state",
	"compacted",
]);

const COMPLETED_ITEM_TYPES = new Set([
	"UserMessage",
	"AgentMessage",
	"Reasoning",
	"CommandExecution",
	"FileChange",
]);

export function codexEntryShape(entry: Entry): string | undefined {
	const type = String(entry.type);
	const known = PAYLOAD_TYPES.get(type);
	if (!known) return IGNORED_ENTRY_TYPES.has(type) ? undefined : type;
	const payload = rolloutPayload(entry);
	const payloadType = rolloutString(payload.type);
	if (type === "event_msg" && payloadType === "item_completed") {
		const itemType = rolloutString(
			rolloutPayload({ payload: payload.item }).type,
		);
		return COMPLETED_ITEM_TYPES.has(itemType)
			? undefined
			: `${type}:item_completed:${itemType}`;
	}
	return known.has(payloadType) ? undefined : `${type}:${payloadType}`;
}
