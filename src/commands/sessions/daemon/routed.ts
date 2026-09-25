import type { SessionClient } from "./broadcast";
import type { SessionManager } from "./SessionManager";

export type Msg = Record<string, unknown>;
export type Handler = (
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
) => void;

export function routed(local: Handler): Handler {
	return (client, m, d) => {
		if (!m.windowsProxy.route(client, d)) local(client, m, d);
	};
}
