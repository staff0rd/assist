import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export type SdkTurnStatus = "running" | "waiting";

export function sdkTurnStatus(message: SDKMessage): SdkTurnStatus | undefined {
	if (message.type === "assistant" && message.parent_tool_use_id === null)
		return "running";
	if (message.type === "result") return "waiting";
	if (message.type === "system" && message.subtype === "session_state_changed")
		return message.state === "running" ? "running" : "waiting";
	return undefined;
}
