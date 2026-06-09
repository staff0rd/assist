import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { persistLiveSessions } from "./loadPersistedSessions";
import { toSessionInfo } from "./toSessionInfo";

export function broadcastSessions(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
): void {
	persistLiveSessions(sessions);
	broadcast(clients, {
		type: "sessions",
		sessions: [...sessions.values()].map(toSessionInfo),
	});
}
