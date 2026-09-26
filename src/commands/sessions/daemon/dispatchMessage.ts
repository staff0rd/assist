import type { SessionClient } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { messageHandlers, type Msg } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

export function dispatchMessage(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	if (typeof data.traceId === "string")
		daemonLog(
			`linked ${data.type} received (cwd=${data.cwd ?? "default"}) trace=${data.traceId}`,
		);
	messageHandlers[data.type as string]?.(client, manager, data);
}
