import type { SessionClient } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { logUnrecognisedType } from "./logUnrecognisedType";
import { messageHandlers, type Msg } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

const unrecognisedTypes = new Set<string>();

export function dispatchMessage(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	if (typeof data.traceId === "string")
		daemonLog(
			`linked ${data.type} received (cwd=${data.cwd ?? "default"}) trace=${data.traceId}`,
		);
	const handler = Object.hasOwn(messageHandlers, data.type as string)
		? messageHandlers[data.type as string]
		: undefined;
	if (handler) handler(client, manager, data);
	else logUnrecognisedType(unrecognisedTypes, "", data.type);
}
