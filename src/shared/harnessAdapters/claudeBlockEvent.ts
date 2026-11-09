import { claudeConnectorTools } from "./claudeConnectorTools";
import type { ConnectorRunEvent } from "./types";

export type ClaudeContentBlock = {
	type?: unknown;
	id?: unknown;
	name?: unknown;
	input?: unknown;
	text?: unknown;
	tool_use_id?: unknown;
	content?: unknown;
};

function record(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

export function claudeBlockEvent(
	block: ClaudeContentBlock,
	tokens: () => number | undefined,
): ConnectorRunEvent | undefined {
	if (block.type === "tool_use") {
		const name = typeof block.name === "string" ? block.name : "tool";
		return {
			type: "toolCall",
			callId: String(block.id),
			tool: claudeConnectorTools.fromNative(name),
			label: claudeConnectorTools.label(name),
			input: record(block.input),
			tokens: tokens(),
		};
	}
	if (
		block.type === "text" &&
		typeof block.text === "string" &&
		block.text.trim()
	)
		return { type: "text", text: block.text, tokens: tokens() };
	return undefined;
}
