import { broadcast, type SessionClient } from "./broadcast";
import type { Session, SessionInfo } from "./createSession";
import { persistLiveSessions } from "./loadPersistedSessions";
import { toSessionInfo } from "./toSessionInfo";

export function broadcastSessions(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	windowsSessions: SessionInfo[] = [],
): void {
	// why: only local sessions are persisted; Windows sessions live on the Windows daemon
	persistLiveSessions(sessions);
	broadcast(clients, {
		type: "sessions",
		sessions: [...sessions.values()].map(toSessionInfo).concat(windowsSessions),
	});
}
