import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import { sdkActivityText } from "./sdkActivityText";

export function trackSdkTurnProgress(
	message: SDKMessage,
	turn: SdkTurnTracker,
): void {
	if (message.type === "assistant" && message.parent_tool_use_id === null)
		turn.setActivity(sdkActivityText(message.message.content));
	if (message.type === "tool_progress" && message.parent_tool_use_id === null)
		turn.setElapsed(message.elapsed_time_seconds);
}
