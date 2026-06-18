import type { ActiveSelection } from "./ActiveSelection";
import { broadcast, type SessionClient } from "./broadcast";
import type { Session, SessionInfo } from "./createSession";
import { persistLiveSessions } from "./loadPersistedSessions";
import { toSessionInfo } from "./toSessionInfo";

export function broadcastSessions(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	windowsSessions: SessionInfo[] = [],
	active?: ActiveSelection,
): void {
	// why: only local sessions are persisted; Windows sessions live on the Windows daemon
	persistLiveSessions(sessions);
	const local = [...sessions.values()].map(toSessionInfo);
	broadcast(clients, {
		type: "sessions",
		sessions: local.concat(windowsSessions),
		active: active?.toJSON() ?? {},
	});
}
