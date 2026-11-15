import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { DrivenTurnEvent } from "../DrivenTurnEvent";
import { sdkActivityText } from "../sdkActivityText";

export function claudeTurnProgress(message: SDKMessage): DrivenTurnEvent[] {
	if (message.type === "assistant" && message.parent_tool_use_id === null)
		return [
			{ kind: "activity", text: sdkActivityText(message.message.content) },
		];
	if (message.type === "tool_progress" && message.parent_tool_use_id === null)
		return [{ kind: "elapsed", seconds: message.elapsed_time_seconds }];
	return [];
}
