import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";

export function logSdkMessage(label: string, message: SDKMessage): void {
	if (message.type === "system" && message.subtype === "init")
		daemonLog(
			`${label} sdk init: claude session ${message.session_id} model ${message.model} permission mode ${message.permissionMode}`,
		);
	if (message.type === "result")
		daemonLog(`${label} sdk turn ended: ${message.subtype}`);
}
