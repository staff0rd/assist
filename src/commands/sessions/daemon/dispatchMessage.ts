import type { SessionClient } from "./broadcast";
import { messageHandlers, type Msg } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

export function dispatchMessage(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	messageHandlers[data.type as string]?.(client, manager, data);
}
