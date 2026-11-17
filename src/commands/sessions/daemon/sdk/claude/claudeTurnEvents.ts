import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { DrivenTurnEvent } from "../DrivenTurnEvent";
import { claudeTurnProgress } from "./claudeTurnProgress";
import { createSdkBackgroundTasks } from "./createSdkBackgroundTasks";
import { createSdkUsageObserver } from "./createSdkUsageObserver";
import { logSdkMessage } from "./logSdkMessage";
import { sdkContextReader } from "./sdkContextReader";
import { sdkTurnStatus } from "./sdkTurnStatus";

export async function* claudeTurnEvents(
	messages: AsyncIterable<SDKMessage>,
	label: string,
): AsyncGenerator<DrivenTurnEvent> {
	const observeUsage = createSdkUsageObserver(
		label,
		sdkContextReader(messages),
	);
	const backgroundTasks = createSdkBackgroundTasks();
	for await (const message of messages) {
		logSdkMessage(label, message);
		observeUsage(message);
		if (message.type === "system" && message.subtype === "init")
			yield { kind: "conversation", id: message.session_id };
		const status = sdkTurnStatus(message);
		if (status) yield { kind: "status", status };
		const background = backgroundTasks(message);
		if (background) yield { kind: "background", tasks: background };
		if (message.type === "prompt_suggestion")
			yield { kind: "suggestion", text: message.suggestion || null };
		yield* claudeTurnProgress(message);
	}
}
