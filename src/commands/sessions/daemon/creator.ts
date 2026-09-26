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
	spawn: (m: SessionManager, d: Msg) => string | { error: string },
): Handler {
	return (client, m, d) => {
		if (m.links.route(client, d)) return;
		const result = spawn(m, d);
		if (typeof result !== "string") {
			sendTo(client, { type: "error", message: result.error });
			return;
		}
		sendTo(client, { type: "created", sessionId: result, isNew });
	};
}
