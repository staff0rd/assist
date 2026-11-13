import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

type SdkInput = {
	messages: AsyncIterable<SDKUserMessage>;
	push: (text: string) => void;
	close: () => void;
};

function userMessage(text: string): SDKUserMessage {
	return {
		type: "user",
		message: { role: "user", content: text },
		parent_tool_use_id: null,
	};
}

/* why: streaming input keeps the claude child alive between turns, so the
 * session waits for its next message instead of exiting after one result. */
export function createSdkInput(): SdkInput {
	const queue: SDKUserMessage[] = [];
	let wake: (() => void) | undefined;
	let closed = false;
	const notify = () => {
		wake?.();
		wake = undefined;
	};
	async function* messages(): AsyncGenerator<SDKUserMessage> {
		while (true) {
			const next = queue.shift();
			if (next) {
				yield next;
				continue;
			}
			if (closed) return;
			await new Promise<void>((resolve) => {
				wake = resolve;
			});
		}
	}
	return {
		messages: messages(),
		push: (text) => {
			queue.push(userMessage(text));
			notify();
		},
		close: () => {
			closed = true;
			notify();
		},
	};
}
