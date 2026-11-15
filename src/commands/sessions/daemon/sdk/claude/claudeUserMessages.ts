import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

export async function* claudeUserMessages(
	texts: AsyncIterable<string>,
): AsyncGenerator<SDKUserMessage> {
	for await (const text of texts)
		yield {
			type: "user",
			message: { role: "user", content: text },
			parent_tool_use_id: null,
		};
}
