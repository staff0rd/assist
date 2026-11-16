import type { ThreadEvent, Usage } from "@openai/codex-sdk";

export async function* withCodexTurnUsage(
	events: AsyncIterable<ThreadEvent>,
	onUsage: (usage: Usage) => void,
): AsyncGenerator<ThreadEvent> {
	for await (const event of events) {
		if (event.type === "turn.completed") onUsage(event.usage);
		yield event;
	}
}
