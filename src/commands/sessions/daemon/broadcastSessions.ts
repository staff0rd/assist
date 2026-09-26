import type { ActiveSelection } from "./ActiveSelection";
import { broadcast } from "./broadcast";
import type { ClientHub } from "./ClientHub";
import type { Session, SessionInfo } from "./createSession";
import { persistLiveSessions } from "./loadPersistedSessions";
import { toSessionInfo } from "./toSessionInfo";

export function broadcastSessions(
	sessions: Map<string, Session>,
	clients: ClientHub,
	linkedSessions: SessionInfo[] = [],
	active?: ActiveSelection,
): void {
	persistLiveSessions(sessions);
	const local = [...sessions.values()].map(toSessionInfo);
	const viewers = clients.viewers();
	broadcast(viewers, {
		type: "sessions",
		sessions: local.concat(linkedSessions),
		active: active?.toJSON() ?? {},
	});
	const peers = new Set([...clients].filter((c) => !viewers.has(c)));
	broadcast(peers, { type: "sessions", sessions: local, active: {} });
}
