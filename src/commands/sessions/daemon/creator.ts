import { type SessionClient, sendTo } from "./broadcast";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;
type Handler = (
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
) => void;

export function creator(
	isNew: boolean,
	spawn: (m: SessionManager, d: Msg) => string,
): Handler {
	return (client, m, d) => {
		if (m.windowsProxy.route(client, d)) return;
		sendTo(client, { type: "created", sessionId: spawn(m, d), isNew });
	};
}
