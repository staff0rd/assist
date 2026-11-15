import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { DrivenTurnStatus } from "../DrivenTurnEvent";

export function sdkTurnStatus(
	message: SDKMessage,
): DrivenTurnStatus | undefined {
	if (message.type === "assistant" && message.parent_tool_use_id === null)
		return "running";
	if (message.type === "result") return "waiting";
	if (message.type === "system" && message.subtype === "session_state_changed")
		return message.state === "running" ? "running" : "waiting";
	return undefined;
}
