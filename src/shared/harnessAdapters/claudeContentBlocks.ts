import type { ClaudeContentBlock } from "./claudeBlockEvent";
import type { ConnectorRunEvent } from "./types";

export function claudeContentBlocks(content: unknown): ClaudeContentBlock[] {
	return Array.isArray(content) ? (content as ClaudeContentBlock[]) : [];
}

function resultText(content: unknown): string {
	if (typeof content === "string") return content;
	return claudeContentBlocks(content)
		.map((block) => (typeof block.text === "string" ? block.text : ""))
		.join("");
}

export function claudeToolResults(content: unknown): ConnectorRunEvent[] {
	return claudeContentBlocks(content)
		.filter((block) => block.type === "tool_result")
		.map((block) => ({
			type: "toolResult",
			callId: String(block.tool_use_id),
			text: resultText(block.content),
		}));
}
