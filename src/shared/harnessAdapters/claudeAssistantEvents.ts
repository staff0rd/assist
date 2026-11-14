import { toolTarget } from "../../commands/sessions/shared/toolTarget";
import { claudeContentBlocksOf } from "./claudeContentBlocksOf";
import { claudeToolOperations } from "./claudeToolOperations";
import type { ConversationEvent } from "./types";

type Block = Record<string, unknown>;

function assistantText(content: unknown): string {
	if (typeof content === "string") return content.trim();
	return claudeContentBlocksOf(content)
		.filter((b) => b.type === "text" && typeof b.text === "string")
		.map((b) => String(b.text).trim())
		.filter(Boolean)
		.join("\n");
}

function toolEvent(block: Block, at?: string): ConversationEvent {
	const tool = typeof block.name === "string" ? block.name : "tool";
	const input =
		block.input && typeof block.input === "object"
			? (block.input as Record<string, unknown>)
			: {};
	const description =
		typeof input.description === "string" ? input.description.trim() : "";
	return {
		kind: "tool",
		tool,
		target: toolTarget(block.input),
		...(description && { description }),
		operations: claudeToolOperations({ toolName: tool, toolInput: input }),
		at,
	};
}

export function claudeAssistantEvents(
	content: unknown,
	at?: string,
): ConversationEvent[] {
	const text = assistantText(content);
	const message: ConversationEvent[] = text
		? [{ kind: "message", role: "assistant", text, at }]
		: [];
	return [
		...message,
		...claudeContentBlocksOf(content)
			.filter((block) => block.type === "tool_use")
			.map((block) => toolEvent(block, at)),
	];
}
